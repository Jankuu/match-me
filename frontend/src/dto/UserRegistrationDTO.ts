import { Game } from "./Game"
import { UserProfileDTO } from "./UserProfile.DTO";


export interface UserRegistrationDTO {
    username: string;
    email: string;
    password: string;
    profile: UserProfileDTO;
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
