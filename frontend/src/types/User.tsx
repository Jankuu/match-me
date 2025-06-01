import { Game } from "../dto/Game";

export type User = {
    id: number;
    username: string;
    email: string;
    password: string;
    profile: {
        name: string;
        profilePicture: string;
        birthDate: string;
        gender: string;
        height: number;
        description: string;
        location?: string;
    };
    interestedMinAge: number;
    interestedMaxAge: number;
    interestedGenders: string[];
    interestedGames?: Game[];
    interestVector: {
        fantasy: number;
        competitive: number;
        action: number;
        story: number;
        complex: number;
    };
    locationData?: {
        placeId: string;
        coordinates: {
            lat: number;
            lng: number;
        };
        isGpsUsed: boolean;
    };
};
