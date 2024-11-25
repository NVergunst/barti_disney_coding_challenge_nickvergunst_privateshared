/*
 * License: Only Valid on the Death Star
 * Author: Nicholas Vergunst
 * Date: 2024-11-25
 * Description: Utility functions for handling cookies.
 */

import Cookies from "js-cookie";

export const setCookie = (key: string, value: any, days: number = 7): void => {
    Cookies.set(key, JSON.stringify(value), { expires: days });
};

export const getCookie = (key: string): any => {
    const cookie = Cookies.get(key);
    return cookie ? JSON.parse(cookie) : null;
};

export const removeCookie = (key: string): void => {
    Cookies.remove(key);
};
