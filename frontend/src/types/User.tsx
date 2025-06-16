// types/User.ts

import { Game } from "./Game"; // Assuming this is your Game type

export type User = {
    id: number;
    username: string;
    email: string;
    password?: string; // Optional if not always sent to frontend for security
    profile: { // This corresponds to your UserProfileDTO
        name: string;
        profilePicture: string | null; // Use null for no picture
        birthDate: string; // "YYYY-MM-DD"
        gender: string; // e.g., "man", "woman", or ""
        height: number;
        description: string;
        // The `location` field here seems to be a specific string within the UserProfileDTO.
        // It's separate from the root-level cityName. Let's keep it as is from your type.
        location?: string; // This would map to `user.getProfile().getLocation()` from your backend.
                           // If this is *always* the cityName, then the type redundancy could be simplified on backend.
                           // For now, we'll treat it as a distinct string within profile.
    };

    interestedMinAge: number | null;
    interestedMaxAge: number | null;
    interestedGenders: string[]; // e.g., ["man"], ["woman"], ["man", "woman"]

    interestedGames: Game[]; // As per UserDTO, it's List<Game> at root. Can be empty array.

    interestVector: { // As per UserDTO
        fantasy: number;
        competitive: number;
        action: number;
        story: number;
        complex: number;
    };

    // Location details directly on User (matching backend UserDTO)
    isGpsUser: boolean | null; // Can be null from backend, manage as boolean
    cityName: string | null; // Your backend has this
    googlePlaceId: string | null;
    lat: number | null;
    lng: number | null;
    radius: number | null;
};