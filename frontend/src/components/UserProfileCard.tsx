import React from "react";
import { Card } from "react-bootstrap";

export type UserProfile = {
  id: number;
  name?: string | null; // ИЗМЕНЕНО: может быть опциональным или null
  profilePicture?: string | null; // ИЗМЕНЕНО: может быть опциональным или null
  birthDate?: string | null; // ИЗМЕНЕНО: может быть опциональным или null
  gender?: string | null; // ИЗМЕНЕНО
  height?: number | null; // ИЗМЕНЕНО
  description?: string | null; // ИЗМЕНЕНО
};

type Props = {
  profile: UserProfile;
};

const calculateAge = (birthDate: string): number => {
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

const UserProfileCard: React.FC<Props> = ({ profile }) => {
  const {
    name,
    profilePicture,
    birthDate,
    gender,
    height,
    description,
  } = profile;

  const age = birthDate ? calculateAge(birthDate) : '999';

  return (
    <Card className="p-3">
      {profilePicture && (
        <div className="text-center mb-3">
          <img
            src={profilePicture.startsWith("data:image")
              ? profilePicture
              : `data:image/jpeg;base64,${profilePicture}`}
            alt="Profile"
            className="rounded-circle"
            style={{ width: "150px", height: "150px", objectFit: "cover" }}
          />
        </div>
      )}
      <h4>{name}</h4>
      <p><strong>Age:</strong> {age}</p>
      <p><strong>Gender:</strong> {gender}</p>
      <p><strong>Height:</strong> {height} cm</p>
      <p><strong>About:</strong> {description}</p>
    </Card>
  );
};

export default UserProfileCard;
