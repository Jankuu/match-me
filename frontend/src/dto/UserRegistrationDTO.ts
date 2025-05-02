
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
}
