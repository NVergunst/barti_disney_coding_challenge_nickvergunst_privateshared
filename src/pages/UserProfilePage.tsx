/*
 * License: Only Valid on the Death Star
 * Author: Nicholas Vergunst
 * Date: 2024-11-25
 * Description: Page component for user profiles.
 */

import React, { useState, useEffect } from "react";
import { getCookie, setCookie } from "../utils/cookies";

interface UserProfile {
    firstName: string; // User's first name
    lastName: string; // User's last name
    birthDate: string; // User's birth date (ISO format: YYYY-MM-DD)
    city: string; // User's city
    state: string; // User's state (e.g., CA, TX)
    favoriteCharacter: string; // User's favorite Disney character
    favoriteRide: string; // User's favorite Disney ride
    favoriteMovie: string; // User's favorite Disney movie
    favoriteDisneyland: string; // User's favorite Disneyland location
    lastModified: string; // Timestamp of the last modification (ISO date string)
}

const defaultProfile: UserProfile = {
    firstName: "John",
    lastName: "Doe",
    birthDate: "1980-01-01", // Default birth date
    city: "San Francisco",
    state: "CA",
    favoriteCharacter: "Elsa",
    favoriteRide: "Space Mountain",
    favoriteMovie: "Moana",
    favoriteDisneyland: "Disney World, Florida",
    lastModified: new Date().toISOString() // Default timestamp for new profiles
};

/**
 * UserProfilePage component allows users to view and edit their profile details.
 * The component supports form validation and displays special messages on birthdays and half-birthdays.
 */
const UserProfilePage: React.FC = () => {
    const [profile, setProfile] = useState<UserProfile>(defaultProfile); // User's profile data
    const [isEditing, setIsEditing] = useState<boolean>(false); // Edit mode state
    const [formErrors, setFormErrors] = useState<string[]>([]); // List of validation errors
    const [age, setAge] = useState<number | null>(null); // Calculated age of the user
    const [showModal, setShowModal] = useState<boolean>(false); // State to control modal visibility
    const [modalMessage, setModalMessage] = useState<string>(""); // Message to display in the modal

    /**
     * Loads the user's profile from cookies and calculates their age on component mount.
     */
    useEffect(() => {
        const savedProfile = getCookie("userProfile"); // Retrieve profile from cookies
        if (savedProfile) {
            setProfile(savedProfile);
        }

        calculateAgeAndCheckSpecialDays(savedProfile?.birthDate || defaultProfile.birthDate); // Calculate age and check for special days
    }, []);

    /**
     * Calculates the user's age and checks for birthdays or half-birthdays.
     * Displays a modal with a special message if applicable.
     * @param {string} birthDate - User's birth date (ISO format).
     */
    const calculateAgeAndCheckSpecialDays = (birthDate: string) => {
        const today = new Date();
        const birth = new Date(`${birthDate}T00:00:00`);

        let currentAge = today.getFullYear() - birth.getFullYear();
        if (today.getMonth() < birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) {
            currentAge--;
        }

        const isBirthday = today.getMonth() === birth.getMonth() && today.getDate() === birth.getDate();

        const halfBirthday = new Date(birth);
        halfBirthday.setDate(halfBirthday.getDate() + 180); // Add 180 days to find the half-birthday
        const isHalfBirthday = today.getMonth() === halfBirthday.getMonth() && today.getDate() === halfBirthday.getDate();

        setAge(currentAge);

        if (isBirthday) {
            setModalMessage("Happy Birthday! 🎉");
            setShowModal(true);
        } else if (isHalfBirthday) {
            setModalMessage("Happy Half-Birthday! 🎉");
            setShowModal(true);
        }
    };

    /**
     * Handles form input changes and updates the profile state.
     * @param {React.ChangeEvent<HTMLInputElement | HTMLSelectElement>} e - Input change event.
     */
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        if (name === "birthDate") {
            try {
                const utcDate = new Date(value + "T00:00:00Z");
                if (!isNaN(utcDate.getTime())) {
                    const isoDate = utcDate.toISOString().split("T")[0]; // Format date as YYYY-MM-DD
                    setProfile({ ...profile, [name]: isoDate });
                }
            } catch (error) {
                console.error("Invalid date input:", error);
            }
        } else {
            setProfile({ ...profile, [name]: value });
        }
    };

    /**
     * Validates the form inputs before saving the profile.
     * @returns {boolean} - True if the form is valid; otherwise false.
     */
    const validateForm = (): boolean => {
        const errors: string[] = [];
        if (!profile.firstName) errors.push("First Name is required.");
        if (!profile.lastName) errors.push("Last Name is required.");
        if (!profile.birthDate) errors.push("Birth Date is required.");
        // if (!profile.favoriteCharacter) errors.push("Favorite Disney Character is required.");
        // if (!profile.favoriteRide) errors.push("Favorite Disney Ride is required.");
        // if (!profile.favoriteMovie) errors.push("Favorite Disney Movie is required.");
        // if (!profile.favoriteDisneyland) errors.push("Favorite Disneyland is required.");

        setFormErrors(errors);
        return errors.length === 0;
    };

    /**
     * Saves the updated profile to cookies and updates the state.
     * Validates the form before saving.
     */
    const saveProfile = () => {
        if (validateForm()) {
            const updatedProfile = {
                ...profile,
                lastModified: new Date().toISOString() // Update the last modified timestamp
            };
            setCookie("userProfile", updatedProfile); // Save profile in cookies
            setProfile(updatedProfile);
            calculateAgeAndCheckSpecialDays(profile.birthDate);
            setIsEditing(false); // Exit edit mode
        }
    };

    /**
     * Cancels the editing process and restores the profile from cookies.
     */
    const cancelEdit = () => {
        const savedProfile = getCookie("userProfile") || defaultProfile;
        setProfile(savedProfile);
        setIsEditing(false);
    };

    return (
        <div className="p-10">
            {/* Modal for Special Messages */}
            {showModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg text-center">
                        <p className="text-lg font-bold">{modalMessage}</p>
                        <button onClick={() => setShowModal(false)} className="mt-4 px-6 py-2 bg-[#054553] text-white rounded-lg hover:bg-[#043D4A]">
                            Close
                        </button>
                    </div>
                </div>
            )}

            {/* Error Messages */}
            {formErrors.length > 0 && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                    {formErrors.map((error, index) => (
                        <p key={index} className="text-sm">
                            {error}
                        </p>
                    ))}
                </div>
            )}

            {/* Display Profile Information */}
            {!isEditing ? (
                <>
                    {/* Name and Last Modified Date */}
                    <div className="flex flex-col items-start gap-2">
                        <h1
                            className="text-[#222222]"
                            style={{ fontFamily: "Lato", fontSize: "40px", fontWeight: 600, lineHeight: "48px", textAlign: "center" }}
                        >
                            {`${profile.firstName} ${profile.lastName}`}
                        </h1>
                        <p
                            className="text-[#222222]"
                            style={{ fontFamily: "Lato", fontSize: "12px", fontWeight: 400, lineHeight: "16px", textAlign: "center" }}
                        >
                            Last Updated{" "}
                            {new Date(profile.lastModified).toLocaleDateString("en-US", {
                                month: "long",
                                day: "numeric",
                                year: "numeric"
                            })}
                        </p>
                    </div>

                    {/* Gap between Name/Date and Details */}
                    <div className="h-[32px]"></div>
                    {/* Details Section */}

                    {/* Profile Details */}
                    <div className="flex flex-col items-start gap-4" style={{ width: "1040px" }}>
                        <p className="text-lg">
                            <span className="font-semibold">Age:</span> {age}
                        </p>
                        <p className="text-lg">
                            <span className="font-semibold">Location:</span> {`${profile.city}, ${profile.state}`}
                        </p>
                        <p className="text-lg">
                            <span className="font-semibold">Favorite Disney Character:</span> {profile.favoriteCharacter}
                        </p>
                        <p className="text-lg">
                            <span className="font-semibold">Favorite Disney Ride:</span> {profile.favoriteRide}
                        </p>
                        <p className="text-lg">
                            <span className="font-semibold">Favorite Disney Movie:</span> {profile.favoriteMovie}
                        </p>
                        <p className="text-lg">
                            <span className="font-semibold">Favorite Disneyland:</span> {profile.favoriteDisneyland}
                        </p>
                    </div>

                    {/* Gap between Details and Edit Button */}
                    <div className="h-[32px]"></div>

                    {/* Edit Profile Button */}
                    <button
                        onClick={() => setIsEditing(true)}
                        className="px-6 py-2 bg-[#054553] text-white rounded-md shadow-md text-sm hover:bg-[#043D4A]"
                    >
                        Edit Profile
                    </button>
                </>
            ) : (
                <>
                    {/* Profile Editing Form */}
                    <div style={{ width: "656px" }}>
                        {/* Form fields for profile editing */}
                        {/* First Name and Last Name */}
                        <div className="flex justify-between mb-4 gap-x-6">
                            <div style={{ width: "320px" }}>
                                <label className="block mb-2 text-sm font-medium text-gray-700">First Name*</label>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={profile.firstName}
                                    onChange={handleInputChange}
                                    className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#054553]"
                                />
                            </div>
                            <div style={{ width: "320px" }}>
                                <label className="block mb-2 text-sm font-medium text-gray-700">Last Name*</label>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={profile.lastName}
                                    onChange={handleInputChange}
                                    className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#054553]"
                                />
                            </div>
                        </div>

                        {/* Birth Date */}
                        <div className="mb-4" style={{ width: "320px" }}>
                            <label className="block mb-2 text-sm font-medium text-gray-700">Birth Date*</label>
                            <input
                                type="date"
                                name="birthDate"
                                value={profile.birthDate}
                                onChange={handleInputChange}
                                className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#054553] appearance-none"
                                style={{
                                    WebkitAppearance: "none",
                                    MozAppearance: "textfield",
                                    appearance: "textfield"
                                }}
                            />
                        </div>

                        {/* City and State */}
                        <div className="flex justify-start mb-4 gap-x-6">
                            <div style={{ width: "320px" }}>
                                <label className="block mb-2 text-sm font-medium text-gray-700">City</label>
                                <input
                                    type="text"
                                    name="city"
                                    value={profile.city}
                                    onChange={handleInputChange}
                                    className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#054553]"
                                />
                            </div>
                            <div style={{ width: "105px" }}>
                                <label className="block mb-2 text-sm font-medium text-gray-700">State</label>
                                <div className="relative">
                                    <select
                                        name="state"
                                        value={profile.state}
                                        onChange={handleInputChange}
                                        className="w-full appearance-none border border-gray-300 rounded-md px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-[#054553] bg-white"
                                    >
                                        <option value="">Select</option>
                                        <option value="AL">AL</option>
                                        <option value="AK">AK</option>
                                        <option value="AZ">AZ</option>
                                        <option value="AR">AR</option>
                                        <option value="CA">CA</option>
                                        <option value="CO">CO</option>
                                        <option value="CT">CT</option>
                                        <option value="DE">DE</option>
                                        <option value="FL">FL</option>
                                        <option value="GA">GA</option>
                                        <option value="HI">HI</option>
                                        <option value="ID">ID</option>
                                        <option value="IL">IL</option>
                                        <option value="IN">IN</option>
                                        <option value="IA">IA</option>
                                        <option value="KS">KS</option>
                                        <option value="KY">KY</option>
                                        <option value="LA">LA</option>
                                        <option value="ME">ME</option>
                                        <option value="MD">MD</option>
                                        <option value="MA">MA</option>
                                        <option value="MI">MI</option>
                                        <option value="MN">MN</option>
                                        <option value="MS">MS</option>
                                        <option value="MO">MO</option>
                                        <option value="MT">MT</option>
                                        <option value="NE">NE</option>
                                        <option value="NV">NV</option>
                                        <option value="NH">NH</option>
                                        <option value="NJ">NJ</option>
                                        <option value="NM">NM</option>
                                        <option value="NY">NY</option>
                                        <option value="NC">NC</option>
                                        <option value="ND">ND</option>
                                        <option value="OH">OH</option>
                                        <option value="OK">OK</option>
                                        <option value="OR">OR</option>
                                        <option value="PA">PA</option>
                                        <option value="RI">RI</option>
                                        <option value="SC">SC</option>
                                        <option value="SD">SD</option>
                                        <option value="TN">TN</option>
                                        <option value="TX">TX</option>
                                        <option value="UT">UT</option>
                                        <option value="VT">VT</option>
                                        <option value="VA">VA</option>
                                        <option value="WA">WA</option>
                                        <option value="WV">WV</option>
                                        <option value="WI">WI</option>
                                        <option value="WY">WY</option>
                                    </select>
                                    {/* Custom dropdown arrow */}
                                    <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                                        <svg
                                            className="w-4 h-4 text-gray-500"
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Favorite Disney Character */}
                        <div className="mb-4" style={{ width: "656px" }}>
                            <label className="block mb-2 text-sm font-medium text-gray-700">Favorite Disney Character</label>
                            <input
                                type="text"
                                name="favoriteCharacter"
                                value={profile.favoriteCharacter}
                                onChange={handleInputChange}
                                className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#054553]"
                            />
                        </div>

                        {/* Favorite Disney Ride */}
                        <div className="mb-4" style={{ width: "656px" }}>
                            <label className="block mb-2 text-sm font-medium text-gray-700">Favorite Disney Ride</label>
                            <input
                                type="text"
                                name="favoriteRide"
                                value={profile.favoriteRide}
                                onChange={handleInputChange}
                                className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#054553]"
                            />
                        </div>

                        {/* Favorite Disney Movie */}
                        <div className="mb-4" style={{ width: "656px" }}>
                            <label className="block mb-2 text-sm font-medium text-gray-700">Favorite Disney Movie</label>
                            <input
                                type="text"
                                name="favoriteMovie"
                                value={profile.favoriteMovie}
                                onChange={handleInputChange}
                                className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#054553]"
                            />
                        </div>

                        {/* Favorite Disneyland */}
                        <div className="mb-4" style={{ width: "320px" }}>
                            <label className="block mb-2 text-sm font-medium text-gray-700">Favorite Disneyland</label>
                            <input
                                type="text"
                                name="favoriteDisneyland"
                                value={profile.favoriteDisneyland}
                                onChange={handleInputChange}
                                className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#054553]"
                            />
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-start mt-6 gap-4">
                        <button
                            onClick={saveProfile}
                            className="px-6 py-2 bg-[#054553] text-white rounded-md shadow-md text-sm hover:bg-[#043D4A] focus:outline-none focus:ring-2 focus:ring-[#043D4A]"
                        >
                            Update Profile
                        </button>
                        <button
                            onClick={cancelEdit}
                            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md shadow-md text-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300"
                        >
                            Cancel
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default UserProfilePage;
