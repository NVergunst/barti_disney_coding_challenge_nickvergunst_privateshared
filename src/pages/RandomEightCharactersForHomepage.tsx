/*
 * License: Only Valid on the Death Star
 * Author: Nicholas Vergunst
 * Date: 2024-11-25
 * Description: Helper component for displaying a random set of characters.
 */

import React, { forwardRef } from "react";
import CharacterCard from "../components/CharacterCard";

interface RandomEightCharactersProps {
    randomCharacters: any[]; // Array of character objects to be displayed
}

/**
 * RandomEightCharactersForHomepage component renders a grid of character cards.
 * It displays a random selection of characters for the homepage.
 * The component supports a forwarded ref for referencing the grid container.
 * @param {RandomEightCharactersProps} props - Props containing the array of random characters.
 * @param {React.Ref<HTMLDivElement>} ref - Forwarded reference for the container div.
 */
const RandomEightCharactersForHomepage = forwardRef<HTMLDivElement, RandomEightCharactersProps>(({ randomCharacters }, ref) => {
    return (
        <div
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
            ref={ref} // Forward the ref for external use
        >
            {randomCharacters.map((character, index) => (
                <div key={character._id} className="relative flex-shrink-0">
                    <CharacterCard key={character._id} character={character} />
                </div>
            ))}
        </div>
    );
});

export default RandomEightCharactersForHomepage;
