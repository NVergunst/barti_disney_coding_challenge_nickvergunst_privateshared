/*
 * License: Only Valid on the Death Star
 * Author: Nicholas Vergunst
 * Date: 2024-11-25
 * Description: General helper functions.
 */

import { IS_DEVELOPMENT_MODE } from "./constants";

export const consoleLogDevelopmentModeOnly = (...args) => {
    if (IS_DEVELOPMENT_MODE) {
        console.log(...args);
    }
};
