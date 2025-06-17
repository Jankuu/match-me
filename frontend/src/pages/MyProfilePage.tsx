import React, { useState, useEffect, useCallback } from "react";
import { Container, Button, Spinner, Alert } from "react-bootstrap";
import { FaEdit } from "react-icons/fa";
import { ArrowLeft } from "react-bootstrap-icons";
import { useNavigate } from "react-router-dom";

import { User } from "../types/User"; // Corrected User type
import { Game } from "../types/Game"; // Corrected Game DTO
import apiClient from "../utils/apiClient";
import ProfilePicture from "../components/formComponents/ProfilePicture";
import AccountForm from "../components/forms/AccountForm";
import axios from "axios"; // For error type checking

/**
 * MyProfilePage component.
 * This page displays and allows editing of the user's profile information.
 * It handles fetching user data (matching UserDTO), managing edit/save states,
 * image uploads, and error/loading feedback.
 */
const MyProfilePage = () => {
    const navigate = useNavigate();

    // --- State Variables ---
    const [user, setUser] = useState<User | null>(null);
    const [draftUser, setDraftUser] = useState<User | null>(null);
    const [allAvailableGames, setAllAvailableGames] = useState<Game[]>([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);

    // State to track form validation status received from AccountForm
    const [isBirthDateValid, setIsBirthDateValid] = useState(true); // From AccountForm
    const [isFormValid, setIsFormValid] = useState(false); // Overall form validity from AccountForm

    // --- Memoized Helper Functions ---
    const ensureDataUrlPrefix = useCallback((base64String: string | undefined | null): string => {
        if (!base64String) return '';
        if (base64String.startsWith("data:image")) return base64String;
        return `data:image/jpeg;base64,${base64String}`;
    }, []);

    const removeDataUrlPrefix = useCallback((dataUrl: string | undefined | null): string => {
        if (!dataUrl) return '';
        const parts = dataUrl.split(',');
        return parts.length > 1 ? parts[1] : dataUrl;
    }, []);

    const readImageAsBase64 = useCallback((file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const result = reader.result as string;
                const base64 = result.split(",")[1];
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }, []);

    // --- useEffect for Loading User Profile Data and All Games ---
    useEffect(() => {
        const loadData = async () => {
            setError(null);
            setLoading(true);

            let fetchedUser: User | null = null;
            const storedUser = localStorage.getItem("user");

            if (storedUser) {
                fetchedUser = JSON.parse(storedUser) as User;
                // Ensure profile picture has the data URL prefix for proper display.
                fetchedUser.profile.profilePicture = ensureDataUrlPrefix(fetchedUser.profile.profilePicture);
                // Ensure other fields have consistent defaults/types if they can be null/undefined from backend
                fetchedUser.email = fetchedUser.email || '';
                fetchedUser.profile.name = fetchedUser.profile.name || '';
                fetchedUser.profile.birthDate = fetchedUser.profile.birthDate || '';
                fetchedUser.profile.gender = fetchedUser.profile.gender || '';
                fetchedUser.profile.height = fetchedUser.profile.height || 0;
                fetchedUser.profile.description = fetchedUser.profile.description || '';
                fetchedUser.profile.location = fetchedUser.profile.location || ''; // Handle profile.location string

                fetchedUser.interestedMinAge = fetchedUser.interestedMinAge || null;
                fetchedUser.interestedMaxAge = fetchedUser.interestedMaxAge || null;
                fetchedUser.interestedGenders = fetchedUser.interestedGenders || [];
                fetchedUser.interestedGames = fetchedUser.interestedGames || [];
                fetchedUser.interestVector = fetchedUser.interestVector || { fantasy: 0, competitive: 0, action: 0, story: 0, complex: 0 }; // Ensure interestVector is always an object

                // Location data at root level
                fetchedUser.isGpsUser = fetchedUser.isGpsUser === true; // Ensure boolean
                fetchedUser.cityName = fetchedUser.cityName || null;
                fetchedUser.googlePlaceId = fetchedUser.googlePlaceId || null;
                fetchedUser.lat = fetchedUser.lat !== null && fetchedUser.lat !== undefined ? fetchedUser.lat : null;
                fetchedUser.lng = fetchedUser.lng !== null && fetchedUser.lng !== undefined ? fetchedUser.lng : null;
                fetchedUser.radius = fetchedUser.radius || null;


            } else if (localStorage.getItem("token")) {
                try {
                    const userRes = await apiClient.get<User>("/users"); // Fetches UserDTO
                    fetchedUser = userRes.data;
                    fetchedUser.profile.profilePicture = ensureDataUrlPrefix(fetchedUser.profile.profilePicture);
                    // Apply same default/consistency checks as above
                    fetchedUser.profile.name = fetchedUser.profile.name || '';
                    fetchedUser.profile.birthDate = fetchedUser.profile.birthDate || '';
                    fetchedUser.profile.gender = fetchedUser.profile.gender || '';
                    fetchedUser.profile.height = fetchedUser.profile.height || 0;
                    fetchedUser.profile.description = fetchedUser.profile.description || '';
                    fetchedUser.profile.location = fetchedUser.profile.location || '';

                    fetchedUser.interestedMinAge = fetchedUser.interestedMinAge || null;
                    fetchedUser.interestedMaxAge = fetchedUser.interestedMaxAge || null;
                    fetchedUser.interestedGenders = fetchedUser.interestedGenders || [];
                    fetchedUser.interestedGames = fetchedUser.interestedGames || [];
                    fetchedUser.interestVector = fetchedUser.interestVector || { fantasy: 0, competitive: 0, action: 0, story: 0, complex: 0 };

                    fetchedUser.isGpsUser = fetchedUser.isGpsUser === true;
                    fetchedUser.cityName = fetchedUser.cityName || null;
                    fetchedUser.googlePlaceId = fetchedUser.googlePlaceId || null;
                    fetchedUser.lat = fetchedUser.lat !== null && fetchedUser.lat !== undefined ? fetchedUser.lat : null;
                    fetchedUser.lng = fetchedUser.lng !== null && fetchedUser.lng !== undefined ? fetchedUser.lng : null;
                    fetchedUser.radius = fetchedUser.radius || null;

                    localStorage.setItem("user", JSON.stringify(fetchedUser));
                } catch (err: any) {
                    console.error("Failed to load user from server", err);
                    if (axios.isAxiosError(err)) {
                        setError(err.message || "Failed to load user profile from server.");
                    } else if (err instanceof Error) {
                        setError(err.message || "An unexpected error occurred while loading profile.");
                    } else {
                        setError("An unknown error occurred while loading profile.");
                    }
                }
            } else {
                setLoading(false);
                navigate("/login");
                return;
            }

            setUser(fetchedUser);

            // Fetch all available games
            try {
                const gamesRes = await apiClient.get<Game[]>("/games");
                setAllAvailableGames(gamesRes.data);
            } catch (err: any) {
                console.error("Failed to load all available games", err);
                if (axios.isAxiosError(err)) {
                    setError(prev => prev ? prev + "\n" + err.message : err.message || "Failed to load available games.");
                } else if (err instanceof Error) {
                    setError(prev => prev ? prev + "\n" + err.message : err.message || "An unexpected error occurred loading games.");
                } else {
                    setError(prev => prev ? prev + "\n" + "An unknown error occurred loading games." : "An unknown error occurred loading games.");
                }
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [navigate, ensureDataUrlPrefix]); // Dependencies: `Maps` (for redirection) and `ensureDataUrlPrefix` (for the helper).

    // --- Memoized Callbacks for Updating Draft User State ---

    /**
     * Handles changes to fields within the nested `profile` (UserProfileDTO) object of the `draftUser`.
     * @param {keyof User["profile"]} field - The name of the UserProfileDTO field to update.
     * @param {any} value - The new value for the field.
     */
    const handleProfileChange = useCallback((field: keyof User["profile"], value: any) => {
        setDraftUser(prevDraft => {
            if (!prevDraft) return null;
            return {
                ...prevDraft,
                profile: {
                    ...prevDraft.profile,
                    [field]: value,
                },
            };
        });
    }, []); // No dependencies needed.

    /**
     * Handles changes to root-level fields of the `draftUser` (UserDTO).
     * @param {Exclude<keyof User, 'profile'>} field - The name of the root UserDTO field to update (excluding 'profile').
     * @param {any} value - The new value for the field.
     */
    const handleRootChange = useCallback((field: Exclude<keyof User, 'profile'>, value: any) => {
        setDraftUser(prevDraft => {
            if (!prevDraft) return null;

            // Special optimization for `interestedGames` to avoid re-rendering if the game selection is logically identical.
            if (field === "interestedGames" && Array.isArray(value)) {
                const currentGames = prevDraft.interestedGames || [];
                const newGames = value as Game[];

                if (currentGames.length !== newGames.length) {
                    // Lengths differ, so arrays are not equal.
                } else {
                    const currentGameIds = new Set(currentGames.map(g => g.id));
                    const newGameIds = new Set(newGames.map(g => g.id));

                    let allEqual = true;
                    if (currentGameIds.size !== newGameIds.size) {
                        allEqual = false;
                    } else {
                        for (const id of newGameIds) {
                            if (!currentGameIds.has(id)) {
                                allEqual = false;
                                break;
                            }
                        }
                    }

                    if (allEqual) {
                        return prevDraft; // Return previous draft to prevent unnecessary re-render
                    }
                }
            }

            return {
                ...prevDraft,
                [field]: value,
            };
        });
    }, []); // No dependencies needed.

    const handleClearProfilePicture = useCallback(() => {
        setDraftUser(prevDraft => {
            if (!prevDraft) return null;
            return {
                ...prevDraft,
                profile: {
                    ...prevDraft.profile,
                    profilePicture: '',
                },
            };
        });
        setSelectedImageFile(null);
    }, []); // No dependencies

    // --- Memoized Callback for Saving Profile Changes ---
    /**
     * Handles the saving of profile changes to the backend.
     * This function is asynchronous as it involves reading files and making API calls.
     * It validates the draft user and birth date before proceeding.
     */
    const handleSave = useCallback(async () => {
        if (!isFormValid || !draftUser?.id) {
            setError("Please ensure all required fields are valid before saving.");
            return;
        }
        setError(null);

        // Create a payload for the backend, matching UserDTO structure
        // Ensure all potentially nullable fields are handled for backend consistency
        const userPayloadForBackend: User = {
            ...draftUser, // Copy current draftUser
            // Ensure profilePicture is raw Base64 (without prefix)
            profile: {
                ...draftUser.profile,
                profilePicture: removeDataUrlPrefix(draftUser.profile.profilePicture),
                location: draftUser.profile.location || null, // Ensure profile.location string is handled
            },
            // Location data is already at root level, just ensure null for empty string or undefined
            cityName: draftUser.cityName || null,
            googlePlaceId: draftUser.googlePlaceId || null,
            lat: draftUser.lat !== null && draftUser.lat !== undefined ? draftUser.lat : null,
            lng: draftUser.lng !== null && draftUser.lng !== undefined ? draftUser.lng : null,
            isGpsUser: draftUser.isGpsUser === true, // Ensure boolean true/false
            radius: draftUser.radius !== null && draftUser.radius !== undefined ? draftUser.radius : null,
            // Ensure other root-level fields are passed correctly
            interestedGames: draftUser.interestedGames || [],
            interestedGenders: draftUser.interestedGenders || [],
            interestedMinAge: draftUser.interestedMinAge !== null && draftUser.interestedMinAge !== undefined ? draftUser.interestedMinAge : null,
            interestedMaxAge: draftUser.interestedMaxAge !== null && draftUser.interestedMaxAge !== undefined ? draftUser.interestedMaxAge : null,
            interestVector: draftUser.interestVector || { fantasy: 0, competitive: 0, action: 0, story: 0, complex: 0 },
            // password might be included if changed, but often excluded for security
        } as User; // Assert type to ensure it matches UserDTO structure

        // If a new image file was selected via the file input, convert it to Base64
        // and override the `profilePicture` in the payload.
        if (selectedImageFile) {
            try {
                const rawBase64Image = await readImageAsBase64(selectedImageFile);
                userPayloadForBackend.profile.profilePicture = rawBase64Image;
            } catch (error) {
                console.error("Failed to convert image to Base64", error);
                setError("Failed to process image for upload.");
                return; // Stop the save process if image conversion fails
            }
        }

        try {
            // Send the modified user data (payload) to the backend using a PATCH request.
            await apiClient.patch(`/users`, userPayloadForBackend);

            // --- Post-Save Actions ---
            // 1. Update the main `user` state for UI display:
            //    The `userPayloadForBackend` already has the correct Base64 (raw) string.
            //    For display, ensure it has the "data:image" prefix again.
            const updatedUserForDisplay = {
                ...userPayloadForBackend,
                profile: {
                    ...userPayloadForBackend.profile,
                    profilePicture: ensureDataUrlPrefix(userPayloadForBackend.profile.profilePicture)
                }
            };
            setUser(updatedUserForDisplay); // Update the main user state with the saved data

            // 2. Update localStorage:
            //    Store the user data in localStorage *as it was sent to the backend* (raw Base64).
            //    This keeps localStorage clean and consistent with API data.
            localStorage.setItem("user", JSON.stringify(userPayloadForBackend));

            // 3. Reset UI states:
            setEditing(false); // Exit editing mode
            setDraftUser(null); // Clear the draft user (no longer needed)
            setSelectedImageFile(null); // Clear any newly selected file
        } catch (err: any) {
            console.error("Failed to save profile", err);
            // Handle various types of errors from the API call
            if (axios.isAxiosError(err)) {
                setError(err.message || "Failed to save profile data.");
            } else if (err instanceof Error) {
                setError(err.message || "An unexpected error occurred while saving profile.");
            } else {
                setError("An unknown error occurred.");
            }
        }
    }, [
        draftUser,             // Depends on the current draft user state
        isFormValid,           // Depends on the overall form validity from AccountForm
        selectedImageFile,     // Depends on any newly selected image file
        removeDataUrlPrefix,   // Depends on the helper function
        readImageAsBase64,     // Depends on the helper function
        ensureDataUrlPrefix    // Depends on the helper function
    ]);

    // --- Memoized Callback to Toggle Editing Mode ---
    /**
     * Toggles the `editing` state.
     * When entering edit mode, it creates a deep copy of the current `user` data into `draftUser`.
     * When exiting edit mode (via "Cancel"), it discards `draftUser` changes and any selected file.
     */
    const toggleEditing = useCallback(() => {
        if (editing) {
            // If currently editing and "Cancel" button is clicked:
            setEditing(false); // Exit editing mode
            setDraftUser(null); // Discard all changes made in the draft
            setSelectedImageFile(null); // Clear any newly selected image file
            setIsBirthDateValid(true); // Reset birth date validation state on cancel
            setIsFormValid(false); // Reset form validity state on cancel, let form re-evaluate on next edit
        } else {
            // If not editing and "Edit" button is clicked:
            setEditing(true); // Enter editing mode
            // Create a deep copy of the current `user` data for editing.
            if (user) {
                // Ensure all fields are properly initialized with defaults if they might be null/undefined
                const copiedUser: User = {
                    ...user,
                    profile: {
                        ...user.profile,
                        name: user.profile.name || '',
                        birthDate: user.profile.birthDate || '',
                        gender: user.profile.gender || '',
                        height: user.profile.height || 0,
                        description: user.profile.description || '',
                        profilePicture: user.profile.profilePicture || null,
                        location: user.profile.location || '', // Handle profile.location string
                    },
                    interestedMinAge: user.interestedMinAge || null,
                    interestedMaxAge: user.interestedMaxAge || null,
                    interestedGenders: user.interestedGenders || [],
                    interestedGames: user.interestedGames || [],
                    interestVector: user.interestVector || { fantasy: 0, competitive: 0, action: 0, story: 0, complex: 0 },
                    isGpsUser: user.isGpsUser === true,
                    cityName: user.cityName || null,
                    googlePlaceId: user.googlePlaceId || null,
                    lat: user.lat !== null && user.lat !== undefined ? user.lat : null,
                    lng: user.lng !== null && user.lng !== undefined ? user.lng : null,
                    radius: user.radius !== null && user.radius !== undefined ? user.radius : null,
                };
                setDraftUser(copiedUser);
                setIsFormValid(true); // Assuming valid initially for existing user
            }
            setSelectedImageFile(null); // Ensure no stale selected file when entering edit mode
        }
    }, [editing, user]); // Dependencies: `editing` (to know current mode) and `user` (to copy its data).

    // --- Conditional Rendering for Loading, Error, and Not Found States ---

    // Display a loading spinner while data is being fetched.
    if (loading) {
        return (
            <Container className="mt-5 text-center">
                <Spinner animation="border" />
            </Container>
        );
    }

    // Display an alert with an error message if an error occurred during loading or saving.
    if (error) {
        return (
            <Container className="mt-5" style={{ maxWidth: "600px" }}>
                <Alert variant="danger">
                    {error}
                    <br/>
                    Please try again later.
                </Alert>
                <Button
                    variant="primary"
                    onClick={() => navigate("/matching")} // Button to go back to matching page
                    className="mt-3"
                >
                    Go Back
                </Button>
            </Container>
        );
    }

    // Display a message if the user profile is not found or is incomplete.
    if (!user || !user.profile) {
        return (
            <Container className="mt-5 text-center">
                <p>Profile not found or incomplete.</p>
                <Button
                    variant="primary"
                    onClick={() => navigate("/login")} // Button to redirect to login page
                    className="mt-3"
                >
                    Login
                </Button>
            </Container>
        );
    }

    // Determine which profile picture to display for preview
    const profilePictureForDisplay = editing && selectedImageFile
        ? URL.createObjectURL(selectedImageFile) // Create temporary URL for preview
        : user.profile.profilePicture || ''; // Show existing picture otherwise

    // --- Main Component Render ---
    return (
        <>
            {/* Top section with navigation and edit/cancel buttons */}
            <div className="d-flex justify-content-between mb-3 px-3 pt-3">
                {/* Back button to navigate to the matching page */}
                <Button
                    onClick={() => navigate("/matching")}
                    className="d-flex align-items-center px-3 py-2 gap-1"
                    variant="primary"
                    style={{ height: "40px" }}
                >
                    <ArrowLeft size={16} />
                    Back
                </Button>

                {/* Edit/Cancel button to toggle editing mode */}
                <Button
                    variant={editing ? "outline-danger" : "outline-primary"} // Changes color based on editing state
                    onClick={toggleEditing} // Toggles the editing mode
                    className="d-flex align-items-center px-3 py-2 gap-1"
                    style={{ height: "40px" }}
                >
                    <FaEdit size={16} />
                    {editing ? "Cancel" : "Edit"} {/* Text changes based on editing state */}
                </Button>
            </div>

            {/* Main profile content container */}
            <Container className="mt-5" style={{ maxWidth: "600px" }}>
                <h2 className="mb-3">My Profile</h2>

                {/* Profile picture display */}
                <ProfilePicture profilePicture={profilePictureForDisplay} />

                {/* AccountForm component: renders the user profile details.
                    It uses `draftUser` if in editing mode, otherwise it uses the main `user` state. */}
                {(editing ? draftUser : user) && ( // Ensure there's a user object to pass to the form
                    <AccountForm
                        profile={editing ? draftUser! : user!} // Pass either draftUser (for edit) or user (for display)
                        editing={editing} // Prop to tell AccountForm if it's in editing mode
                        onProfileChange={handleProfileChange} // Callback for profile sub-fields (e.g., name, gender)
                        onRootChange={handleRootChange} // Callback for root user fields (e.g., interestedGames, cityName, lat, lng, radius)
                        onSave={handleSave} // Callback for the save button
                        onImageChange={setSelectedImageFile} // Callback for when a new image file is selected
                        currentImageFile={selectedImageFile} // Pass the currently selected new image file
                        onClearProfilePicture={handleClearProfilePicture} // Callback for clearing the profile picture
                        onBirthDateValidationChange={setIsBirthDateValid} // Callback to receive birth date validation status
                        onFormValidationChange={setIsFormValid} // Callback to receive overall form validation status
                        allAvailableGames={allAvailableGames} // Pass all available games to AccountForm
                    />
                )}
            </Container>
        </>
    );
};

export default MyProfilePage;