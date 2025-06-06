import dayjs from 'dayjs';

export const calculateAge = (birthDate?: string): string | number => {
  return birthDate ? dayjs().diff(dayjs(birthDate), 'year') : '?';
};

export const getProfilePicture = (base64: string | undefined): string => {
  if (base64) {
    return `data:image/jpeg;base64,${base64}`;
  }
  return "/Profile-Placeholder.jpg";
};
