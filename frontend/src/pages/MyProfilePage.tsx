import React, { useState, useEffect } from "react";
import { Container, Button, Spinner } from "react-bootstrap";
import { FaEdit } from "react-icons/fa";
import { ArrowLeft } from "react-bootstrap-icons";
import { useNavigate } from "react-router-dom";
import ProfileForm from "../components/profileForm/ProfileForm";
import ProfilePicture from "../components/profileForm/ProfilePicture";
import { User } from "../types/User";
import apiClient from "../utils/apiClient";

const MyProfilePage = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      setLoading(false);
      return;
    }

    const user = JSON.parse(storedUser) as User;

    if (
      user.profile.profilePicture &&
      !user.profile.profilePicture.startsWith("data:image")
    ) {
      user.profile.profilePicture = `data:image/jpeg;base64,${user.profile.profilePicture}`;
    }

    setUser(user);
    setLoading(false);
  }, []);

  const handleChange = (field: keyof User["profile"], value: any) => {
    if (!user) return;
    setUser({
      ...user,
      profile: {
        ...user.profile,
        [field]: value,
      },
    });
  };

  const handleSave = async () => {
    if (!user?.id) return;
    try {
      await apiClient.patch(`/users/profile?id=${user.id}`, user.profile);

      localStorage.setItem("user", JSON.stringify(user));

      setEditing(false);
    } catch (error) {
      console.error("Failed to save profile", error);
    }
  };

  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" />
      </Container>
    );
  }

  if (!user) {
    return (
      <Container className="mt-5 text-center">
        <p>Profile not found.</p>
      </Container>
    );
  }

  return (
    <>
      <div className="px-3 pt-3">
        <Button
          onClick={() => navigate("/matching")}
          className="d-flex align-items-center"
        >
          <ArrowLeft size={20} className="me-1" />
          Back
        </Button>
      </div>

      <Container className="mt-5" style={{ maxWidth: "600px" }}>
        <h2 className="mb-3">My Profile</h2>

        <Button
          variant={editing ? "outline-secondary" : "outline-primary"}
          onClick={() => setEditing(!editing)}
          className="mb-3"
        >
          <FaEdit className="me-1" />
          {editing ? "Cancel" : "Edit"}
        </Button>

        <ProfilePicture profilePicture={user.profile.profilePicture} />

        <ProfileForm
          profile={user}
          editing={editing}
          onChange={handleChange}
          onSave={handleSave}
        />
      </Container>
    </>
  );
};

export default MyProfilePage;
