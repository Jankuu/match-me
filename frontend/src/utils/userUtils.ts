import dayjs from 'dayjs';

export const calculateAge = (birthDate?: string): string | number => {
  return birthDate ? dayjs().diff(dayjs(birthDate), 'year') : '?';
};

export const getProfilePicture = (base64?: string): string => {
  return base64 ? `data:image/jpeg;base64,${base64}` : 'https://via.placeholder.com/50';
};
