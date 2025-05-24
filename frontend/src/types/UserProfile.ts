//for cards only
export type UserProfile = {
    id: number;
    name: string;
    profilePicture?: string;
    birthDate?: string;
    gender?: 'man' | 'woman' | string;
    height?: number;
    description?: string;
  };
  