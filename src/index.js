/*
 * License: Only Valid on the Death Star
 * Author: Nicholas Vergunst
 * Date: 2024-11-25
 * Description: Application entry point, rendering the root React component.
 */
import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App.tsx";
import reportWebVitals from "./reportWebVitals";

ReactDOM.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
    document.getElementById("root")
);

reportWebVitals();
