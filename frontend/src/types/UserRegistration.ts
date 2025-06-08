import { Game } from "./Game"
import { UserProfile } from "./UserProfile";


export interface UserRegistration {
    username: string;
    email: string;
    password: string;
    profile: UserProfile;
    interestedMinAge: number;
    interestedMaxAge: number;
    interestedGenders: string[];
    interestedGames: Game[];

    // Location data
    isGpsUser?: boolean;
    cityName?: string;
    googlePlaceId?: string;
    lat?: number;
    lng?: number;
    radius?: number;
}
