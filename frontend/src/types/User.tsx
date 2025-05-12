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
    interestVector: {
        fantasy: number;
        competitive: number;
        action: number;
        story: number;
        complex: number;
    };
};
