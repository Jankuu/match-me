import React from "react";
import { Container, Card } from "react-bootstrap";
import { ArrowLeft } from "react-bootstrap-icons";
import { useNavigate } from "react-router-dom";
import { UserProfile } from "../types/UserProfile";

type UserProfileComponentProps = {
  profile: UserProfile;
};

const calculateAge = (birthDate?: string): number | null => {
  if (!birthDate) return null;
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

const UserProfileComponent: React.FC<UserProfileComponentProps> = ({ profile }) => {
  const navigate = useNavigate();
  const age = calculateAge(profile.birthDate);

  return (
    <>
      <div className="px-3 pt-3">
        <button onClick={() => navigate("/matching")} className="btn btn-outline-secondary">
          <ArrowLeft size={20} className="me-1" />
          Back
        </button>
      </div>

      <Container className="mt-4" style={{ maxWidth: "600px" }}>
        <Card className="p-4 shadow">
          <div className="text-center mb-3">
            {profile.profilePicture ? (
              <img
                src={
                  profile.profilePicture.startsWith("data:image")
                    ? profile.profilePicture
                    : `data:image/jpeg;base64,${profile.profilePicture}`
                }
                alt="Profile"
                className="rounded-circle"
                style={{ width: "150px", height: "150px", objectFit: "cover" }}
              />
            ) : (
              <div
                className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center"
                style={{ width: "150px", height: "150px", fontSize: "24px" }}
              >
                {profile.name.charAt(0)}
              </div>
            )}
          </div>

          <h3 className="text-center">{profile.name}</h3>
          {age !== null && <p className="text-center text-muted">Age: {age}</p>}
          {profile.gender && <p className="text-center">Gender: {profile.gender}</p>}
          {profile.height && <p className="text-center">Height: {profile.height} cm</p>}
          {profile.description && (
            <>
              <h5 className="mt-4">About</h5>
              <p>{profile.description}</p>
            </>
          )}
        </Card>
      </Container>
    </>
  );
};

export default UserProfileComponent;
