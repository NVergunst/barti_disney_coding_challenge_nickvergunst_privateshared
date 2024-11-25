/*
 * License: Only Valid on the Death Star
 * Author: Nicholas Vergunst
 * Date: 2024-11-25
 * Description: UI component for displaying a character card.
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

interface CharacterCardProps {
    character: {
        _id: string; // Unique identifier for the character
        name: string; // Name of the character
        imageUrl?: string; // Optional URL for the character's image
        films?: string[]; // Array of featured film titles
    };
    refCallback?: (node: HTMLDivElement | null) => void; // Optional callback for accessing the DOM node
}

const PLACEHOLDER_IMAGE = "https://placehold.co/200x200";

/**
 * CharacterCard component displays information about a character.
 * Includes the character's image, name, films, and a button to view their profile.
 * @param {CharacterCardProps} props - The props containing character data and an optional ref callback.
 */
const CharacterCard: React.FC<CharacterCardProps> = ({ character, refCallback }) => {
    const navigate = useNavigate(); // Hook for programmatic navigation
    const [imageError, setImageError] = useState(false); // State to track image load errors

    /**
     * Navigates to the character's profile page based on their ID.
     */
    const handleViewProfile = () => {
        navigate(`/character/${character._id}`);
    };

    return (
        <div
            ref={refCallback || undefined} // Passes the refCallback if provided
            className="flex flex-col items-center p-0 gap-4 relative w-[248px] h-[416px] bg-white shadow-lg rounded-lg"
        >
            {/* Character Image */}
            <img
                src={imageError || !character.imageUrl ? PLACEHOLDER_IMAGE : character.imageUrl} // Fallback to placeholder if image fails
                alt={character.name}
                className="w-[248px] h-[248px] object-cover rounded-t-lg"
                loading="lazy" // Improves performance by lazy-loading the image
                onError={() => setImageError(true)} // Updates state on image load error
            />

            {/* Character Name */}
            <h3 className="text-center font-bold text-lg leading-[22px] text-[#222222]">{character.name}</h3>

            {/* Featured Films Section */}
            {character.films && character.films.length > 0 && (
                <div className="text-center">
                    <h4 className="font-bold text-sm leading-[18px] text-[#222222]">Featured Films</h4>
                    <p
                        className="text-sm font-normal text-[#222222] overflow-hidden text-ellipsis"
                        style={{
                            display: "-webkit-box",
                            WebkitBoxOrient: "vertical",
                            WebkitLineClamp: 2, // Limits the text to 2 lines with ellipsis
                            overflow: "hidden"
                        }}
                    >
                        {character.films.join(", ")}
                    </p>
                </div>
            )}

            {/* View Profile Button */}
            <button
                onClick={handleViewProfile} // Navigate to the character's profile on click
                className="text-center font-extrabold text-xs leading-[14px] text-[#222222] underline uppercase"
            >
                View Profile
            </button>
        </div>
    );
};

export default CharacterCard;
