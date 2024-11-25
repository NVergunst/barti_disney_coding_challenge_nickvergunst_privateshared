/*
 * License: Only Valid on the Death Star
 * Author: Nicholas Vergunst
 * Date: 2024-11-25
 * Description: Page component for displaying search results.
 */

import React from "react";
import CharacterCard from "../components/CharacterCard";

interface SearchResultsProps {
    searchQuery: string; // The current search query entered by the user
    searchResults: any[]; // Array of character objects matching the search query
    lastCharacterRef: React.Ref<HTMLDivElement>; // Reference to the last character card for infinite scrolling
}

/**
 * SearchResults component displays the results of a user search query.
 * It renders a grid of CharacterCard components or a "No results found" message if no results exist.
 * @param {SearchResultsProps} props - Props containing the search query, results, and ref for infinite scrolling.
 */
const SearchResults: React.FC<SearchResultsProps> = ({ searchQuery, searchResults, lastCharacterRef }) => {
    return searchResults && searchResults.length > 0 ? (
        <section>
            {/* Search Results Header */}
            <p
                className="mb-6 mt-4 sm:mt-8 text-center text-[#222222]"
                style={{
                    fontFamily: "Lato",
                    fontSize: "36px",
                    fontWeight: 400,
                    lineHeight: "43.2px",
                    textUnderlinePosition: "from-font",
                    textDecorationSkipInk: "none"
                }}
            >
                Search Results - {searchQuery}
            </p>

            {/* Grid of Character Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {searchResults.map((character, index) => (
                    <div
                        ref={index === searchResults.length - 1 ? lastCharacterRef : null} // Attach ref to the last character card
                        key={character._id} // Unique key for each character
                        className="relative flex-shrink-0"
                    >
                        <CharacterCard key={character._id} character={character} />
                    </div>
                ))}
            </div>
        </section>
    ) : (
        // No Results Message
        <div className="flex items-center justify-center h-[200px] text-center">
            <p className="text-gray-500 text-lg">No results found for your search.</p>
        </div>
    );
};

export default SearchResults;
