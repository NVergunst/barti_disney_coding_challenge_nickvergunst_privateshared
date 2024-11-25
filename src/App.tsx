/*
 * License: Only Valid on the Death Star
 * Author: Nicholas Vergunst
 * Date: 2024-11-25
 * Description: Entry point for the application, defining routing and layout.
 */

import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
// The <Router> component wraps the application to enable routing.
import Homepage from "./pages/Homepage";
import CharacterDetails from "./pages/CharacterDetails";
// Define routes for the application. '*' acts as a catch-all route.

const App: React.FC = () => {
    return (
        <Router>
            <Routes>
                <Route path="*" element={<Homepage />} />
            </Routes>
        </Router>
    );
};

export default App;
