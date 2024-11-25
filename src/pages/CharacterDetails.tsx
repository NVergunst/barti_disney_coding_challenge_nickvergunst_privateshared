/*
 * License: Only Valid on the Death Star
 * Author: Nicholas Vergunst
 * Date: 2024-11-25
 * Description: Page component for detailed character information.
 */

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getCacheCharacters } from "../utils/cacheUtils";

interface Character {
    _id: number;
    name: string;
    imageUrl?: string;
    films?: string[];
    shortFilms?: string[];
    tvShows?: string[];
    videoGames?: string[];
    parkAttractions?: string[];
    updatedAt?: string;
    sourceUrl?: string;
}

interface CharacterDetailsProps {}

const CharacterDetails: React.FC<CharacterDetailsProps> = () => {
    const { id } = useParams<{ id: string }>();

    const [expandFilms, setExpandFilms] = useState(false);
    const [expandShortFilms, setExpandShortFilms] = useState(false);
    const [expandTVShows, setExpandTVShows] = useState(false);
    const [character, setCharacter] = useState<Character | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCharacters = async () => {
            try {
                const characters = await getCacheCharacters(); // Fetch from IndexedDB
                if (!characters) {
                    setError("Characters not found.");
                    setLoading(false);
                    return;
                }
                const foundCharacter = characters.find((char) => char._id === Number(id));
                if (!foundCharacter) {
                    setError("Character not found.");
                } else {
                    setCharacter(foundCharacter);
                }
            } catch (err) {
                setError("Failed to fetch character details.");
            } finally {
                setLoading(false);
            }
        };

        fetchCharacters();
    }, [id]);

    if (loading) {
        return <div className="text-center py-10">Loading...</div>;
    }

    if (error) {
        return <div className="text-center py-10">{error}</div>;
    }

    if (!character) {
        return <div className="text-center py-10">Character not found.</div>;
    }

    if (!character) {
        return <div className="text-center py-10">Character not found</div>;
    }

    const renderList = (items: string[], expanded: boolean, setExpanded: React.Dispatch<React.SetStateAction<boolean>>) => (
        <>
            <ul className="list-disc ml-6 text-gray-700">
                {(expanded ? items : items.slice(0, 3)).map((item) => (
                    <li key={item}>{item}</li>
                ))}
            </ul>
            {items.length > 3 && (
                <button onClick={() => setExpanded(!expanded)} className="text-sm text-[#054553] font-semibold mt-2 underline">
                    {expanded ? "Show Less" : "Show More"}
                </button>
            )}
        </>
    );

    return (
        <div className="flex flex-row align-start p-[80px] gap-[40px] bg-[#F1F2F3] mx-auto">
            {/* Character Image */}
            <div className="flex-shrink-0">
                <img
                    src={character.imageUrl || "https://placehold.co/300x400"}
                    alt={character.name}
                    className="w-[300px] h-[400px] object-cover rounded-lg shadow-md"
                />
            </div>

            {/* Character Details */}
            <div className="flex flex-col justify-between w-full">
                {/* Header Section */}
                <div>
                    <h1 className="text-4xl font-bold text-gray-800">{character.name}</h1>
                    <p className="text-sm text-gray-600 mt-2">
                        Last Updated{" "}
                        {new Date(character.updatedAt || "").toLocaleDateString("en-US", {
                            month: "long",
                            day: "numeric",
                            year: "numeric"
                        })}
                    </p>
                </div>

                {/* Featured Sections */}
                <div className="mt-6 space-y-6">
                    {/* Featured Films */}
                    {character.films?.length > 0 && (
                        <div>
                            <h2 className="text-lg font-bold text-gray-800">Featured Films</h2>
                            {renderList(character.films, expandFilms, setExpandFilms)}
                        </div>
                    )}

                    {/* Short Films */}
                    {character.shortFilms?.length > 0 && (
                        <div>
                            <h2 className="text-lg font-bold text-gray-800">Short Films</h2>
                            {renderList(character.shortFilms, expandShortFilms, setExpandShortFilms)}
                        </div>
                    )}

                    {/* TV Shows */}
                    {character.tvShows?.length > 0 && (
                        <div>
                            <h2 className="text-lg font-bold text-gray-800">TV Shows</h2>
                            {renderList(character.tvShows, expandTVShows, setExpandTVShows)}
                        </div>
                    )}
                </div>

                {/* Explore More Button */}
                <a
                    href={character.sourceUrl || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-6 px-6 py-3 w-[270px] bg-[#054553] text-white rounded-md shadow-md hover:bg-[#043D4A] transition duration-300 text-center"
                >
                    Explore More Character Details
                </a>
            </div>
        </div>
    );
};

export default CharacterDetails;
