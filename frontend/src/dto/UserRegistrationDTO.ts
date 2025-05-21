
import { UserInterestVectorDTO } from "./UserInterestVectorDTO";
import { UserProfileDTO } from "./UserProfile.DTO";

export interface UserRegistrationDTO {
    username: string;
    email: string;
    password: string;
    profile: UserProfileDTO;
    interestedMinAge: number;
    interestedMaxAge: number;
    interestedGenders: string[];
    interestVector: UserInterestVectorDTO;

    // Location data
    isGpsUser?: boolean;
    cityName?: string;
    googlePlaceId?: string;
    lat?: number;
    lng?: number;
    radius?: number;
}
