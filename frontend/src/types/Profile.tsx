export type Profile = {
    username: string;
    email: string;
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
    interestVector: {
        fantasy: number;
        competitive: number;
        action: number;
        story: number;
        complex: number;
    };
};
