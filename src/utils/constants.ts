/*
 * License: Only Valid on the Death Star
 * Author: Nicholas Vergunst
 * Date: 2024-11-25
 * Description: Global constants used throughout the project.
 */

export const BASE_URL = process.env.REACT_APP_API_BASE_URL;
export const IS_DEVELOPMENT_MODE = process.env.REACT_APP_ENV === "development";

export const API_KEY___GET_ALL_CHARACTER_RQ = "request_all_characters";
export const API_KEY___GET_SEARCH_QUERY_NAME_RQ = "request_search_name";

export const CACHE_KEY___ALL_CHARACTERS = "all_characters";
export const CACHE_KEY___API_CALLS = "api_calls";
export const CACHE_KEY___FEATURED_CHARACTERS = "featured_characters";
export const CACHE_KEY___RANDOM_TL_CHARACTERS = "random_characters";

export const CACHE_EXPIRATION_QUICK_MINUTES = 10; // 10 Minutes for test, probably 1 day in production
export const CACHE_EXPIRATION_LONG_MINUTES = 7 * 24 * 60; // 1 Week

export const CACHE_EXPIRATION___API_KEYS_MINUTES = IS_DEVELOPMENT_MODE ? CACHE_EXPIRATION_QUICK_MINUTES : CACHE_EXPIRATION_LONG_MINUTES;
export const CACHE_EXPIRATION___ALL_CHARACTERS_MINUTES = IS_DEVELOPMENT_MODE ? CACHE_EXPIRATION_QUICK_MINUTES : CACHE_EXPIRATION_LONG_MINUTES;
export const CACHE_EXPIRATION___FEATURED_CHARACTERS_MINUTES = IS_DEVELOPMENT_MODE ? CACHE_EXPIRATION_QUICK_MINUTES : CACHE_EXPIRATION_LONG_MINUTES;
export const CACHE_EXPIRATION___RANDOM_TL_CHARACTERS_MINUTES = IS_DEVELOPMENT_MODE ? CACHE_EXPIRATION_QUICK_MINUTES : CACHE_EXPIRATION_LONG_MINUTES;

export const FOOTER_HEIGHT = 160; // Footer height in pixels
