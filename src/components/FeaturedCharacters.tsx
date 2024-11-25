/*
 * License: Only Valid on the Death Star
 * Author: Nicholas Vergunst
 * Date: 2024-11-25
 * Description: Component for displaying featured characters.
 */

import React, { forwardRef } from "react";
import CharacterCard from "./CharacterCard";

interface FeaturedCharactersProps {
    featuredCharacters: any[]; // Array of featured character objects
}

/**
 * FeaturedCharacters component displays a section of featured characters using CharacterCard components.
 * This component supports a forwarded ref for the root container.
 * @param {FeaturedCharactersProps} props - Props containing the featured characters data.
 * @param {React.Ref<HTMLDivElement>} ref - Forwarded reference for the outer container div.
 */
const FeaturedCharacters = forwardRef<HTMLDivElement, FeaturedCharactersProps>(({ featuredCharacters }, ref) => {
    return (
        <div ref={ref || undefined}>
            {/* Container for the featured characters section */}
            <div
                className="flex flex-col items-center px-20 py-10 gap-10 bg-[#054553] w-full"
                style={{ minHeight: "619px" }} // Sets a minimum height for the section
            >
                {/* Section Title */}
                <h2 className="font-lato text-white text-4xl font-normal leading-[43px] text-center">Featured Characters!</h2>

                {/* Container for Character Cards */}
                <div className="flex flex-row items-center gap-6 w-[1040px] justify-center">
                    {featuredCharacters.map((character) => (
                        <CharacterCard
                            key={character._id} // Uses character's unique ID as the React key
                            character={character} // Passes character data to the CharacterCard component
                        />
                    ))}
                </div>
            </div>
        </div>
    );
});

export default FeaturedCharacters;
