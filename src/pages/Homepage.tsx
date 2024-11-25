/*
 * License: Only Valid on the Death Star
 * Author: Nicholas Vergunst
 * Date: 2024-11-25
 * Description: Page component for the homepage.
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Route, Routes } from "react-router-dom";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import UserProfilePage from "../pages/UserProfilePage";
import CharacterCard from "../components/CharacterCard";
import FeaturedCharacters from "../components/FeaturedCharacters";
import {
    updateCache,
    getCachedData,
    setCacheData,
    updateCharacterCache,
    getCacheCharacters,
    getCacheFeaturedCharacters,
    setCacheFeaturedCharacters,
    getCacheRandomTopLevelCharacters,
    setCacheRandomTopLevelCharacters,
    getCacheAPICalls,
    setCacheAPICalls,
    trackAPICallInCache
} from "../utils/cacheUtils";
import { fetchGetAllCharactersURL, getAllCharacters, mergeResults, translateAllCharacterGetInfo } from "../utils/api";
import axios from "axios";
import { API_KEY___GET_ALL_CHARACTER_RQ, BASE_URL, FOOTER_HEIGHT } from "../utils/constants";
import { consoleLogDevelopmentModeOnly } from "../utils/helpers";
import SearchResults from "./SearchResults";
import RandomEightCharactersForHomepage from "./RandomEightCharactersForHomepage";
import CharacterDetails from "./CharacterDetails";

/**
 * Homepage component serves as the main page of the application.
 * It includes 8 random top level characters, 4 featured characters, and search functionality.
 * There is also an infinite scrolling feature for loading more characters that is disabled because originally
 * I thought all the characters were to be displayed under the featured characters but I realized I imagined that, so I have disabled it.
 */
const Homepage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // State for various aspects of the homepage
    const [characters, setCharacters] = useState<any[]>([]); // All characters loaded for infinite scrolling
    const [randomCharacters, setRandomCharacters] = useState<any[]>([]); // Random characters for the homepage
    const [featuredCharacters, setFeaturedCharacters] = useState<any[]>([]); // Featured characters for the homepage
    const [searchResults, setSearchResults] = useState<any[]>([]); // Search results
    const [loading, setLoading] = useState<boolean>(false); // Loading state
    const [nextPage, setNextPage] = useState<string>("1"); // Tracks next page for infinite scrolling
    const [searchQuery, setSearchQuery] = useState<string>(""); // Current search query
    const [searchInProgress, setSearchInProgress] = useState<boolean>(false); // Tracks if a search is active
    const [userScrolledDown, setUserScrolledDown] = useState<boolean>(false); // Tracks user scroll position
    const [stickyFooter, setStickyFooter] = useState<boolean>(false); // Determines if the footer is sticky

    // Refs for managing scroll-based functionality
    const observer = useRef<IntersectionObserver | null>(null);
    const featuredCharactersRef = useRef<HTMLDivElement | null>(null); // Ref for FeaturedCharacters section
    const randomCharactersRef = useRef<HTMLDivElement | null>(null); // Ref for RandomCharacters section

    /**
     * Logs cached API URLs and timestamps for debugging purposes.
     */
    const outputCachedUrls = () => {
        const apiCalls = getCacheAPICalls() || [];
        const now = Date.now();

        const formattedCalls = apiCalls
            .filter((call: any) => call.url) // Ensure the `url` exists
            .map(({ url, timestamp }: any) => {
                const fetchedTime = new Date(timestamp).getTime();
                const secondsAgo = Math.round((now - fetchedTime) / 1000);
                return {
                    url: url.replace(BASE_URL, ""), // Strip the base URL
                    fetchedAt: timestamp,
                    secondsAgo
                };
            });

        consoleLogDevelopmentModeOnly("Cached API URLs and timestamps:", formattedCalls);
        consoleLogDevelopmentModeOnly("Number of cached URLs:", formattedCalls.length);
    };

    /**
     * Loads initial data for the homepage from cache or API.
     * Determines random and featured characters.
     */
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                setLoading(true);

                const cachedCharacters = await getCacheCharacters();

                consoleLogDevelopmentModeOnly("Checking cache for random and featured characters.");
                consoleLogDevelopmentModeOnly("Number of characters in cache:", cachedCharacters.length);
                consoleLogDevelopmentModeOnly("Cached characters:", JSON.stringify(cachedCharacters.map(({ _id, name }: any) => ({ _id, name }))));

                outputCachedUrls();

                if (!cachedCharacters.length) {
                    // Fetch data from the API if the cache is empty
                    consoleLogDevelopmentModeOnly("Cache is empty. Fetching first page from API.");
                    const allCharacterData = await getAllCharacters(nextPage !== null ? Number(nextPage) : 1);
                    updateCharacterCache(allCharacterData.allCharacters);

                    const random = allCharacterData.allCharacters.sort(() => 0.5 - Math.random()).slice(0, 8);
                    const featured = allCharacterData.allCharacters.sort(() => 0.5 - Math.random()).slice(0, 4);

                    setCacheRandomTopLevelCharacters(random);
                    setCacheFeaturedCharacters(featured);

                    setRandomCharacters(random);
                    setFeaturedCharacters(featured);
                    setNextPage(allCharacterData.nextPage !== null ? allCharacterData.nextPage.toString() : null);
                } else {
                    // Load characters from cache
                    consoleLogDevelopmentModeOnly("Characters loaded from cache.");
                    setCharacters(cachedCharacters);

                    let cachedRandom = getCacheRandomTopLevelCharacters() || [];
                    let cachedFeatured = getCacheFeaturedCharacters() || [];

                    // Generate random characters if not cached
                    if (!cachedRandom.length) {
                        consoleLogDevelopmentModeOnly("Random characters not in cache or expired. Selecting new ones.");
                        cachedRandom = cachedCharacters.sort(() => 0.5 - Math.random()).slice(0, 8);
                        setCacheRandomTopLevelCharacters(cachedRandom);
                    }
                    setRandomCharacters(cachedRandom);

                    // Generate featured characters if not cached
                    if (!cachedFeatured.length) {
                        consoleLogDevelopmentModeOnly("Featured characters not in cache or expired. Selecting new ones.");
                        cachedFeatured = cachedCharacters.sort(() => 0.5 - Math.random()).slice(0, 4);
                        setCacheFeaturedCharacters(cachedFeatured);
                    }
                    setFeaturedCharacters(cachedFeatured);
                }

                setLoading(false);
            } catch (err) {
                console.error("Failed to load initial data:", err);
                setLoading(false);
            }
        };

        loadInitialData();
    }, []);

    /**
     * Loads more characters for infinite scrolling.
     * Fetches from cache or API as needed.
     */
    const loadMoreCharacters = async () => {
        if (!nextPage || loading || searchInProgress || !userScrolledDown) return;

        try {
            setLoading(true);

            const cachedCharacters = await getCacheCharacters();
            const remainingCharacters = cachedCharacters.filter((character) => !characters.some((displayed) => displayed._id === character._id));

            const newCharacters = remainingCharacters.slice(0, 8);

            if (newCharacters.length > 0) {
                setCharacters((prev) => [...prev, ...newCharacters]);
            }

            if (newCharacters.length < 8 && nextPage) {
                const allCharacterData = await getAllCharacters(Number(nextPage));
                const apiCharacters = allCharacterData.allCharacters;

                updateCharacterCache(apiCharacters);
                const charactersToAdd = apiCharacters.slice(0, 8 - newCharacters.length);
                setCharacters((prev) => [...prev, ...charactersToAdd]);

                setNextPage(allCharacterData.nextPage !== null ? allCharacterData.nextPage.toString() : null);
            }

            setLoading(false);
        } catch (err) {
            console.error("Error loading more characters:", err);
            setLoading(false);
        }
    };

    /**
     * Handles infinite scrolling by observing the last character element.
     */
    const lastCharacterRef = useCallback(
        (node: HTMLDivElement) => {
            if (loading || searchInProgress || !userScrolledDown) return;

            if (observer.current) observer.current.disconnect();
            observer.current = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting && nextPage) {
                    loadMoreCharacters();
                }
            });

            if (node) observer.current.observe(node);
        },
        [loading, nextPage, searchInProgress, userScrolledDown]
    );

    /**
     * Handles search results, updating the UI and state with new data.
     * @param {string} query - The search query.
     * @param {any[]} results - Search results.
     */
    const handleSearchResults = (query: string, results: any[]) => {
        consoleLogDevelopmentModeOnly(`Search results received for query '${query}'.`);

        if (location.pathname !== "/") {
            navigate("/", { replace: true });
        }

        setSearchInProgress(true);
        setSearchResults(results);
        setSearchQuery(query);
    };

    /**
     * Initiates the search process by resetting relevant state.
     */
    const handleBeginSearch = () => {
        consoleLogDevelopmentModeOnly("Beginning search.");
        setSearchResults([]); // Clear search results
        setCharacters([]); // Clear infinite scroll content
        setNextPage(null); // Stop infinite scrolling during search
        window.scrollTo(0, 0); // Scroll to top when search results are displayed
        setSearchInProgress(true); // Reset search state
    };

    /**
     * Ends the search process and resets the state.
     */
    const handleEndSearch = () => {
        consoleLogDevelopmentModeOnly("Ending search.");
        setSearchInProgress(false);
    };

    return (
        <div className="border border-gray-200">
            <Header onSearch={handleSearchResults} onBeginSearch={handleBeginSearch} onEndSearch={handleEndSearch} updateCache={updateCache} />

            <main className="main-content mx-auto px-6 py-8 sm:px-[80px] bg-white shadow-md rounded-lg">
                <div className="bg-[#F1F2F3] py-[80px] px-[40px] sm:px-[80px]">
                    <Routes>
                        <Route path="/profile" element={<UserProfilePage />} />
                        <Route
                            path="/search"
                            element={<SearchResults searchQuery={searchQuery} searchResults={searchResults} lastCharacterRef={lastCharacterRef} />}
                        />
                        <Route path="/character/:id" element={<CharacterDetails />} />
                        <Route
                            path="/"
                            element={
                                searchInProgress ? (
                                    <SearchResults searchQuery={searchQuery} searchResults={searchResults} lastCharacterRef={lastCharacterRef} />
                                ) : (
                                    <section className="mb-10">
                                        <RandomEightCharactersForHomepage randomCharacters={randomCharacters} ref={randomCharactersRef} />
                                    </section>
                                )
                            }
                        />
                    </Routes>
                </div>

                <div ref={featuredCharactersRef}>
                    <FeaturedCharacters featuredCharacters={featuredCharacters} />
                </div>

                {loading && <p className="text-center text-gray-600">Loading...</p>}
            </main>

            {/* Footer */}
            <div className={`${stickyFooter ? "sticky bottom-0 z-50 bg-white shadow-lg" : "bg-gray-100"}`}>
                <Footer />
            </div>
        </div>
    );
};

export default Homepage;
