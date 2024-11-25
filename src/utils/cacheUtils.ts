/*
 * License: Only Valid on the Death Star
 * Author: Nicholas Vergunst
 * Date: 2024-11-25
 * Description: Utilities for caching data.
 */

import { get } from "http";
import {
    CACHE_KEY___ALL_CHARACTERS,
    CACHE_KEY___API_CALLS,
    CACHE_KEY___FEATURED_CHARACTERS,
    CACHE_KEY___RANDOM_TL_CHARACTERS,
    CACHE_EXPIRATION_LONG_MINUTES,
    CACHE_EXPIRATION_QUICK_MINUTES,
    CACHE_EXPIRATION___API_KEYS_MINUTES,
    CACHE_EXPIRATION___RANDOM_TL_CHARACTERS_MINUTES,
    CACHE_EXPIRATION___FEATURED_CHARACTERS_MINUTES,
    CACHE_EXPIRATION___ALL_CHARACTERS_MINUTES
} from "./constants";
import { consoleLogDevelopmentModeOnly } from "./helpers";

/**
 * Caches data into localStorage with a specific expiration time.
 * @param {string} key - The unique key to identify the cache entry.
 * @param {any} data - The data to be stored in the cache.
 * @param {number} expirationMinutes - Expiration time in minutes.
 */
export const setCacheData = (key: string, data: any, expirationMinutes: number) => {
    const expirationTime = Date.now() + expirationMinutes * 60 * 1000;
    const cachedData = { data, expirationTime };
    localStorage.setItem(key, JSON.stringify(cachedData));
};

/**
 * Stores featured characters in the cache.
 * @param {any[]} characters - Array of featured character data.
 */
export const setCacheFeaturedCharacters = (characters: any[]) => {
    setCacheData(CACHE_KEY___FEATURED_CHARACTERS, characters, CACHE_EXPIRATION___FEATURED_CHARACTERS_MINUTES);
};

/**
 * Stores random top-level characters in the cache.
 * @param {any[]} characters - Array of character data.
 */
export const setCacheRandomTopLevelCharacters = (characters: any[]) => {
    setCacheData(CACHE_KEY___RANDOM_TL_CHARACTERS, characters, CACHE_EXPIRATION___RANDOM_TL_CHARACTERS_MINUTES);
};

/**
 * Stores API call data in the cache.
 * @param {any[]} calls - Array of API call metadata.
 */
export const setCacheAPICalls = (calls: any[]) => {
    setCacheData(CACHE_KEY___API_CALLS, calls, CACHE_EXPIRATION___API_KEYS_MINUTES);
};

/**
 * Retrieves data from the cache, ensuring it hasn't expired.
 * @param {string} key - The unique key to identify the cache entry.
 * @returns {any|null} - Returns cached data or null if expired or non-existent.
 */
export const getCachedData = (key: string) => {
    cleanUpCache();
    const cachedData = localStorage.getItem(key);
    if (cachedData) {
        const { data, expirationTime } = JSON.parse(cachedData);
        if (Date.now() < expirationTime) {
            return data;
        } else {
            localStorage.removeItem(key);
        }
    }
    return null;
};

/**
 * Retrieves featured characters from the cache.
 * @returns {any|null} - Cached featured characters or null.
 */
export const getCacheFeaturedCharacters = () => {
    return getCachedData(CACHE_KEY___FEATURED_CHARACTERS);
};

/**
 * Retrieves random top-level characters from the cache.
 * @returns {any|null} - Cached random characters or null.
 */
export const getCacheRandomTopLevelCharacters = () => {
    return getCachedData(CACHE_KEY___RANDOM_TL_CHARACTERS);
};

/**
 * Retrieves API call data from the cache.
 * @returns {any|null} - Cached API call data or null.
 */
export const getCacheAPICalls = () => {
    return getCachedData(CACHE_KEY___API_CALLS);
};

/**
 * Updates an existing cache entry by adding new data.
 * Ensures no duplicates are stored.
 * @param {any[]} newData - New data to add to the cache.
 * @param {string} key - The cache key to update.
 * @param {number} [expiration=CACHE_EXPIRATION_LONG_MINUTES] - Expiration time for the updated cache.
 */
export const updateCache = (newData: any[], key: string, expiration: number = CACHE_EXPIRATION_LONG_MINUTES) => {
    const existingCache = getCachedData(key) || { data: [], info: {} };
    const uniqueItems = newData.filter((item) => !existingCache.data.some((cachedItem) => cachedItem._id === item._id));
    const updatedCache = [...existingCache.data, ...uniqueItems];
    setCacheData(key, { data: updatedCache, info: existingCache.info }, expiration);
};

/**
 * Cleans up expired cache entries from localStorage.
 * Specifically handles API call entries to ensure timestamps are valid.
 */
export const cleanUpCache = () => {
    const keysToRemove: string[] = [];
    let removedApiCallsCount = 0;

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
            const cachedItem = localStorage.getItem(key);
            try {
                const parsedItem = JSON.parse(cachedItem || "{}");

                if (parsedItem.expirationTime && Date.now() > parsedItem.expirationTime) {
                    keysToRemove.push(key);
                }

                if (key === CACHE_KEY___API_CALLS && Array.isArray(parsedItem.data)) {
                    const validApiCalls = parsedItem.data.filter((call) => {
                        const callTimestamp = new Date(call.timestamp).getTime();
                        return Date.now() - callTimestamp < CACHE_EXPIRATION___API_KEYS_MINUTES * 60 * 1000;
                    });

                    removedApiCallsCount += parsedItem.data.length - validApiCalls.length;

                    if (validApiCalls.length > 0) {
                        setCacheData(CACHE_KEY___API_CALLS, validApiCalls, CACHE_EXPIRATION___API_KEYS_MINUTES);
                    } else {
                        keysToRemove.push(CACHE_KEY___API_CALLS);
                    }
                }
            } catch (error) {
                console.error(`Error parsing cache item for key: ${key}`, error);
            }
        }
    }

    if (keysToRemove.length > 0) {
        keysToRemove.forEach((key) => localStorage.removeItem(key));
        consoleLogDevelopmentModeOnly(`Cleaned up ${keysToRemove.length} expired cache entries.`);
    }

    if (removedApiCallsCount > 0) {
        consoleLogDevelopmentModeOnly(`Cleaned up ${removedApiCallsCount} expired API call entries from the cache.`);
    }
};

/**
 * Opens a connection to the IndexedDB database.
 * @returns {Promise<IDBDatabase>} - Promise resolving to the database instance.
 */
const openDatabase = () => {
    return new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open("CharacterCacheDB", 1);
        request.onupgradeneeded = (event) => {
            const db = request.result;

            if (!db.objectStoreNames.contains(CACHE_KEY___ALL_CHARACTERS)) {
                db.createObjectStore(CACHE_KEY___ALL_CHARACTERS, { keyPath: "_id" });
            }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = (event) => reject(request.error);
    });
};

/**
 * Saves an array of data into an IndexedDB store.
 * @param {string} storeName - The name of the store in IndexedDB.
 * @param {any[]} data - Array of data to store.
 */
const setIndexedDBData = async (storeName: string, data: any[]) => {
    const db = await openDatabase();
    const transaction = db.transaction(storeName, "readwrite");
    const store = transaction.objectStore(storeName);

    data.forEach((item) => {
        store.put(item);
    });

    return new Promise<void>((resolve, reject) => {
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
    });
};

/**
 * Retrieves all data from an IndexedDB store.
 * @param {string} storeName - The name of the store in IndexedDB.
 * @returns {Promise<any[]>} - Promise resolving to an array of stored data.
 */
const getIndexedDBData = async (storeName: string) => {
    const db = await openDatabase();
    const transaction = db.transaction(storeName, "readonly");
    const store = transaction.objectStore(storeName);

    return new Promise<any[]>((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};

/**
 * Clears all data from a specific IndexedDB store.
 * @param {string} storeName - The name of the store in IndexedDB.
 */
const clearIndexedDBStore = async (storeName: string) => {
    const db = await openDatabase();
    const transaction = db.transaction(storeName, "readwrite");
    const store = transaction.objectStore(storeName);

    return new Promise<void>((resolve, reject) => {
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
};

/**
 * Stores character data into IndexedDB.
 * @param {any[]} characters - Array of character data to cache.
 */
export const setCacheCharacters = async (characters: any[]) => {
    consoleLogDevelopmentModeOnly("Saving characters to IndexedDB...");
    await setIndexedDBData(CACHE_KEY___ALL_CHARACTERS, characters);
};

/**
 * Retrieves all character data from IndexedDB.
 * @returns {Promise<any[]>} - Promise resolving to an array of character data.
 */
export const getCacheCharacters = async () => {
    consoleLogDevelopmentModeOnly("Fetching characters from IndexedDB...");
    return await getIndexedDBData(CACHE_KEY___ALL_CHARACTERS);
};

/**
 * Updates the character cache in IndexedDB by adding new entries.
 * Ensures no duplicate entries are stored.
 * @param {any[]} newData - Array of new character data to add.
 */
export const updateCharacterCache = async (newData: any[]) => {
    const existingCache = (await getCacheCharacters()) || [];
    const uniqueItems = newData.filter((item) => !existingCache.some((cachedItem) => cachedItem._id === item._id));

    const updatedCache = [...existingCache, ...uniqueItems];

    consoleLogDevelopmentModeOnly(`Adding ${uniqueItems.length} items into cache (IDB), now sized ${updatedCache.length}`);
    await setCacheCharacters(updatedCache);
};

/**
 * Tracks an API call in the cache.
 * @param {string} url - The URL of the API call.
 * @param {string} type - The type of API call (e.g., GET, POST).
 * @param {object} [info] - Additional metadata for the API call.
 */
export const trackAPICallInCache = (url: string, type: string, info?: object) => {
    const apiCalls = getCacheAPICalls() || [];
    const timestamp = new Date().toISOString();
    const updatedCalls = [...apiCalls, { url, type, info, timestamp }];
    setCacheAPICalls(updatedCalls);
    consoleLogDevelopmentModeOnly(`API call tracked as successful: ${type} - ${url}`);
};
