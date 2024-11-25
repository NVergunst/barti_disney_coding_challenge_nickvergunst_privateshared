/*
 * License: Only Valid on the Death Star
 * Author: Nicholas Vergunst
 * Date: 2024-11-25
 * Description: API utility functions for data fetching.
 */
import axios from "axios";
import { updateCache, getCachedData, updateCharacterCache, trackAPICallInCache } from "../utils/cacheUtils"; // Import cache utilities
import { API_KEY___GET_ALL_CHARACTER_RQ, BASE_URL } from "../utils/constants";
import { consoleLogDevelopmentModeOnly } from "./helpers";

/**
 * Fetch all characters with pagination.
 */
export const fetchGetAllCharactersURL = (page: number = 1, perPage?: number) => {
    return `${BASE_URL}?page=${page}${perPage ? `&pageSize=${perPage}` : ""}`;
};

export const getAllCharacters = async (
    nextPage: number = 1,
    maxPages: number = 1,
    perPage: number = 50,
    onNewResults?: (newResults: any[], allResults: any[], currentPage: number, totalPages: number) => void
) => {
    let allCharacters = [];
    let currentPage = nextPage;
    let totalPages = 1;

    try {
        while (currentPage <= totalPages && currentPage <= maxPages) {
            const response = await axios.get(fetchGetAllCharactersURL(currentPage, perPage));
            const { data, info } = response.data;

            trackAPICallInCache(fetchGetAllCharactersURL(currentPage, perPage), API_KEY___GET_ALL_CHARACTER_RQ, translateAllCharacterGetInfo(info));

            allCharacters = [...allCharacters, ...data];
            totalPages = info.totalPages;

            if (onNewResults) {
                onNewResults(data, allCharacters, currentPage, totalPages);
            }

            currentPage += 1;
        }
    } catch (error) {
        console.error("Error fetching all characters:", error);
        throw error;
    }

    return {
        allCharacters: allCharacters,
        nextPage: currentPage <= totalPages ? currentPage : null,
        totalPages: totalPages,
        totalPagesAtPerPage: perPage
    };
};

export const getOneCharacter = async (id) => {
    try {
        const response = await axios.get(`${BASE_URL}/${id}`);
        return response.data.data;
    } catch (error) {
        console.error(`Error fetching character with ID ${id}:`, error);
        throw error;
    }
};

export const translateAllCharacterGetInfo = (rawInfo: any) => {
    if (!rawInfo) return null;

    const { count, totalPages, previousPage, nextPage } = rawInfo;

    return {
        count: typeof count === "number" ? count : null,
        totalPages: typeof totalPages === "number" ? totalPages : null,
        previousPage: typeof previousPage === "string" ? previousPage : null,
        nextPage: typeof nextPage === "string" ? nextPage : null
    };
};

/**
 * Merge results from local and API sources.
 */
export const mergeResults = (localResults, apiResults) => {
    const ids = new Set(localResults.map((item) => item._id));
    return [...localResults, ...apiResults.filter((item) => !ids.has(item._id))];
};

export const fetchSearchQueryURL = (query, nextPageURL?) => {
    return nextPageURL ? `${nextPageURL}&name=${query}` : `${BASE_URL}?name=${query}`;
};

export const fetchSearchQueryFromAPI = async (
    query: string,
    updatePageResults?: (results: any[]) => void,
    signal?: AbortSignal
): Promise<{ results: any[]; isComplete: boolean }> => {
    const results = [];
    const updatePageResultsFunc = updatePageResults ? updatePageResults : (results: any[]) => {};

    let nextPage = fetchSearchQueryURL(query);

    try {
        while (nextPage) {
            consoleLogDevelopmentModeOnly(`Fetching data from API: ${nextPage}`);
            const response = await fetch(nextPage, { signal });
            if (response.status === 204) break; // Handle empty response gracefully

            const data = await response.json();

            results.push(...data.data);

            updateCharacterCache(data.data);
            updatePageResultsFunc([...results]);

            const nextPageUrl = data.info.nextPage;
            nextPage = nextPageUrl ? fetchSearchQueryURL(query, nextPageUrl) : null;
        }

        return { results, isComplete: true };
    } catch (err) {
        if (err.name === "AbortError") {
            consoleLogDevelopmentModeOnly(`API call for query "${query}" was aborted.`);
        } else {
            console.error("Error fetching data from API:", err);
        }

        return { results, isComplete: false };
    }
};
