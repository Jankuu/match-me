//for cards only
export type CardUserProfile = {
    id: number;
    name: string;
    profilePicture?: string;
    birthDate?: string;
    gender?: 'man' | 'woman' | string;
    height?: number;
    description?: string;
  };
  