/*
 * License: Only Valid on the Death Star
 * Author: Nicholas Vergunst
 * Date: 2024-11-25
 * Description: Header component for navigation, branding, and search functionality.
 */

import React, { useRef, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { updateCache, getCachedData, getCacheCharacters, trackAPICallInCache, getCacheAPICalls } from "../utils/cacheUtils"; // Import cache utilities
import { getAllCharacters, mergeResults, fetchSearchQueryFromAPI, fetchSearchQueryURL } from "../utils/api"; // Import API utilities
import { API_KEY___GET_SEARCH_QUERY_NAME_RQ, CACHE_EXPIRATION_QUICK_MINUTES } from "../utils/constants";
import { consoleLogDevelopmentModeOnly } from "../utils/helpers";

const SESSION_QUERY_KEY = "search_queries"; // Key for storing session-based queries

/**
 * Header component that provides:
 * - Navigation to the profile page.
 * - Search functionality with caching and API fetching.
 * - Branding with a logo.
 * @param {Object} props - Props for the Header component.
 * @param {Function} [props.onSearch] - Callback for handling search results.
 * @param {Function} [props.onBeginSearch] - Callback when search begins.
 * @param {Function} [props.onEndSearch] - Callback when search ends.
 * @param {Function} [props.updateCache] - Optional function to update the cache.
 */
const Header: React.FC<{
    onSearch?: (query: string, results: any[]) => void;
    onBeginSearch?: () => void;
    onEndSearch?: () => void;
    updateCache?: (newData: any[], key?: string) => void;
}> = ({ onSearch, onBeginSearch, onEndSearch, updateCache }) => {
    const navigate = useNavigate(); // For navigation
    const location = useLocation(); // For getting the current location

    const handleSearch = onSearch || (() => {}); // Default to no-op if `onSearch` is not provided
    const handleBeginSearch = onBeginSearch || (() => {}); // Default to no-op
    const handleEndSearch = onEndSearch || (() => {}); // Default to no-op
    const handleUpdateCache = updateCache || (() => {}); // Default to no-op

    const [searchQuery, setSearchQuery] = useState<string>(""); // Current search query
    const [isTyping, setIsTyping] = useState<boolean>(false); // Tracks typing state
    const [searchTimer, setSearchTimer] = useState<number | null>(null); // Timer for debouncing search
    const [prevSearchQuery, setPrevSearchQuery] = useState<string>(""); // Tracks the previous search query

    const abortControllerRef = useRef<AbortController | null>(null); // For aborting ongoing fetch requests
    const activeQueryTokenRef = useRef<string | null>(null); // Tracks the active query token
    const searchInputRef = useRef<HTMLInputElement>(null); // Ref for the search input

    /**
     * Navigates to the profile page when the profile button is clicked.
     */
    const handleProfileClick = () => {
        navigate("/profile");
    };

    /**
     * Effect to handle search functionality with debouncing.
     * Triggers on every update to `searchQuery`.
     */
    useEffect(() => {
        const debounceSearch = async () => {
            if (searchQuery.trim()) {
                const newToken = Date.now().toString(); // Generate a unique token for the search
                const abortController = new AbortController();

                // Abort the previous search query if exists
                if (abortControllerRef.current) {
                    consoleLogDevelopmentModeOnly(`Aborting previous query: ${prevSearchQuery}`);
                    abortControllerRef.current.abort();

                    if (prevSearchQuery) {
                        scheduleBackgroundFetch(prevSearchQuery);
                    }
                }

                activeQueryTokenRef.current = newToken;
                abortControllerRef.current = abortController;
                setIsTyping(false);

                const { parsedQuery, filters } = parseSearchQuery(searchQuery);

                // Human-readable log for debugging
                const humanizedQuery = humanizeSearchQuery(parsedQuery, filters);
                consoleLogDevelopmentModeOnly(humanizedQuery);

                // Search in local cache
                const cachedCharacters = await getCacheCharacters();
                const localMatches = searchLocalCache(cachedCharacters, parsedQuery, filters);
                handleSearch(parsedQuery, localMatches);

                // Skip API query if conditions are met
                if (shouldSkipApiQuery(parsedQuery)) {
                    return;
                }

                // Fetch from the API and handle results
                const { results, isComplete } = await fetchSearchQueryFromAPI(
                    parsedQuery,
                    (newSearchResults) => {
                        if (activeQueryTokenRef.current === newToken) {
                            const combinedResults = mergeResults(localMatches, newSearchResults);
                            handleSearch(parsedQuery, combinedResults);
                        }
                        handleUpdateCache(newSearchResults);
                    },
                    abortController.signal
                );

                // Track API call in cache if the search is complete
                if (isComplete) {
                    trackAPICallInCache(fetchSearchQueryURL(parsedQuery), API_KEY___GET_SEARCH_QUERY_NAME_RQ, { query: parsedQuery });
                }
            }
        };

        const humanizeSearchQuery = (query: string, filters: Record<string, string>): string => {
            const humanizedFilters = Object.entries(filters)
                .map(([field, value]) => `${field.charAt(0).toUpperCase() + field.slice(1)} containing '${value}'`)
                .join(" AND ");

            return `Searching for Characters containing '${query}' ${humanizedFilters ? `AND ${humanizedFilters}` : ""}`;
        };

        const scheduleBackgroundFetch = (abortedQuery: string) => {
            if (shouldSkipApiQuery(abortedQuery)) {
                return;
            }
            consoleLogDevelopmentModeOnly(`Scheduling background fetch for: ${abortedQuery}`);
            window.requestIdleCallback(async () => {
                const { parsedQuery, filters } = parseSearchQuery(abortedQuery);

                try {
                    const { results, isComplete } = await fetchSearchQueryFromAPI(
                        parsedQuery,
                        (newSearchResults) => {
                            handleUpdateCache(newSearchResults);
                        },
                        undefined
                    );

                    if (isComplete) {
                        trackAPICallInCache(fetchSearchQueryURL(abortedQuery), API_KEY___GET_SEARCH_QUERY_NAME_RQ, { query: parsedQuery });
                    }
                } catch (error) {
                    consoleLogDevelopmentModeOnly(`Background fetch for ${abortedQuery} failed:`, error);
                }
            });
        };

        if (searchTimer) {
            clearTimeout(searchTimer); // Clear previous timer
        }
        setSearchTimer(window.setTimeout(debounceSearch, isTyping ? 500 : 250)); // Debounce delay

        return () => searchTimer && clearTimeout(searchTimer);
    }, [searchQuery]);

    /**
     * Handles changes in the search input.
     * @param {React.ChangeEvent<HTMLInputElement>} e - Input change event.
     */
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newQuery = e.target.value;

        // Trigger appropriate callbacks based on query changes
        if (!searchQuery && newQuery) {
            handleBeginSearch();
        }
        if (searchQuery && !newQuery) {
            handleEndSearch();
        }

        setPrevSearchQuery(searchQuery);
        setSearchQuery(newQuery);
        setIsTyping(true);
    };

    return (
        <header className="flex flex-row items-center px-[120px] py-[32px] gap-[40px] bg-white w-full h-[112px] sticky top-0 z-50">
            {/* Logo Section */}
            <div className="flex items-center">
                <a href="/">
                    <img src="/assets/images/original_mouse_house_logo-cropped.svg" alt="Mouse House Logo" className="h-[40px] w-auto" />
                </a>
            </div>

            {/* Search Bar */}
            <div className="flex-1 mx-4 relative">
                <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search for characters, e.g., 'films:Fant'"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="w-full h-[48px] px-4 sm:px-[16px] border-none rounded-[100px] shadow-sm focus:outline-none bg-[#F1F2F3] text-[#222222] placeholder-[#A7B6C5]"
                    style={{
                        fontFamily: "Lato",
                        fontSize: "15px",
                        fontWeight: 400,
                        lineHeight: "18px"
                    }}
                />
            </div>

            {/* Profile Button */}
            <div className="flex items-center justify-center">
                <button
                    className="flex items-center justify-center w-[48px] h-[48px] bg-[#054553] rounded-full"
                    style={{ padding: "12px" }}
                    onClick={handleProfileClick}
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M3 20C5.33579 17.5226 8.50702 16 12 16C15.493 16 18.6642 17.5226 21 20M16.5 7.5C16.5 9.98528 14.4853 12 12 12C9.51472 12 7.5 9.98528 7.5 7.5C7.5 5.01472 9.51472 3 12 3C14.4853 3 16.5 5.01472 16.5 7.5Z"
                            stroke="#C2CCDA"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </button>
            </div>
        </header>
    );
};

export default Header;

/**
 * Filters the local cache to match the search query.
 * @param {any[]} cache - Cached character data.
 * @param {string} query - Parsed search query.
 * @param {Record<string, string>} filters - Search filters applied to specific fields.
 * @returns {any[]} - Array of matching results from the cache.
 */
const searchLocalCache = (cache: any[], query: string, filters: Record<string, string>) => {
    const regex = new RegExp(query, "i");
    return cache.filter((character) => {
        let matchesQuery = regex.test(character.name);

        for (const [field, value] of Object.entries(filters)) {
            const fieldRegex = new RegExp(value, "i");
            if (Array.isArray(character[field])) {
                matchesQuery = matchesQuery && character[field].some((item: string) => fieldRegex.test(item));
            } else {
                matchesQuery = matchesQuery && fieldRegex.test(character[field] || "");
            }
        }

        return matchesQuery;
    });
};

/**
 * Determines if an API query should be skipped based on cache timing.
 * @param {string} query - The search query to evaluate.
 * @returns {boolean} - True if the query should be skipped; otherwise false.
 */
const shouldSkipApiQuery = (query: string): boolean => {
    const apiCalls = getCacheAPICalls() || [];
    const now = Date.now();

    for (const call of apiCalls) {
        const { info, timestamp } = call;

        if (info?.query && query.toLowerCase().includes(info.query.toLowerCase())) {
            const fetchTime = new Date(timestamp).getTime();
            const timeElapsed = now - fetchTime;
            const timeElapsedInSeconds = Math.round(timeElapsed / 1000);

            if (timeElapsed < CACHE_EXPIRATION_QUICK_MINUTES * 60 * 1000) {
                consoleLogDevelopmentModeOnly(
                    `Skipping API query for '${query}' as '${info.query}' was fetched ${timeElapsedInSeconds} seconds ago.`
                );
                return true;
            } else {
                consoleLogDevelopmentModeOnly(
                    `API query for '${query}' is in cache but expired. It was fetched ${timeElapsedInSeconds} seconds ago.`
                );
            }
        }
    }

    return false;
};

/**
 * Parses the search query into main query and field-based filters.
 * @param {string} query - The search query string.
 * @returns {{ parsedQuery: string, filters: Record<string, string> }} - Parsed query and filters.
 */
const parseSearchQuery = (query: string) => {
    const filters: Record<string, string> = {};
    const parsedQuery = query
        .replace(/(\w+):(['"]?)([^\s'"]+)\2/g, (match, field, _, value) => {
            filters[field] = value;
            return "";
        })
        .trim();
    return { parsedQuery, filters };
};
