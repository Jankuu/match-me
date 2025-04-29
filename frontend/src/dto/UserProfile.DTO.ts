export interface UserProfileDTO {
    name: string;
    profilePicture: number[]; // массив байтов изображения
    birthDate: string; // строка в формате "yyyy-MM-dd"
    gender: string;    // например, "man" или "woman"
    height: number;
    description: string;
}
