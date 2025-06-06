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
    console.log('Use effect');
    const loadUser = async () => {
      
      const storedUser = localStorage.getItem("user");
  
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser) as User;
  
        // Picture
        if (
          parsedUser.profile.profilePicture &&
          !parsedUser.profile.profilePicture.startsWith("data:image")
        ) {
          parsedUser.profile.profilePicture = `data:image/jpeg;base64,${parsedUser.profile.profilePicture}`;
        }
  
        setUser(parsedUser);
        setLoading(false);
      } else if (localStorage.getItem("token")) {
        console.log("No user found, but token exists");
        try {
          const res = await apiClient.get<User>("/users");
  
          const fetchedUser = res.data;
  
          if (
            fetchedUser.profile.profilePicture &&
            !fetchedUser.profile.profilePicture.startsWith("data:image")
          ) {
            fetchedUser.profile.profilePicture = `data:image/jpeg;base64,${fetchedUser.profile.profilePicture}`;
          }
  
          setUser(fetchedUser);
          localStorage.setItem("user", JSON.stringify(fetchedUser));
        } catch (error) {
          console.error("Failed to load user from server", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
  
    loadUser();
  }, []);

  //user.profile.***
const handleProfileChange = (field: keyof User["profile"], value: any) => {
  if (!user) return;
  setUser({
    ...user,
    profile: {
      ...user.profile,
      [field]: value,
    },
  });
};

//user.***
const handleRootChange = (field: keyof User, value: any) => {
  if (!user) return;
  setUser({
    ...user,
    [field]: value,
  });
};

  const handleSave = async () => {
    if (!user?.id) return;
    try {
      await apiClient.patch(`/users`, user);

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

  if (!user || !user.profile) {
    return (
      <Container className="mt-5 text-center">
        <p>Profile not found or incomplete.</p>
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
          onProfileChange={handleProfileChange}
          onRootChange={handleRootChange}
          onSave={handleSave}
          onLocationDataChange={(locationData) => {
            if (locationData) {
              setUser(prevUser => {
                if (!prevUser) return prevUser;
                return {
                  ...prevUser,
                  locationData,
                  profile: {
                    ...prevUser.profile,
                    location: prevUser.profile.location
                  }
                };
              });
            } else {
              setUser(prevUser => {
                if (!prevUser) return prevUser;
                const updatedUser = { ...prevUser };
                delete updatedUser.locationData;
                return {
                  ...updatedUser,
                  profile: {
                    ...updatedUser.profile,
                    location: ""
                  }
                };
              });
            }
          }}

        />
      </Container>
    </>
  );
};

export default MyProfilePage;
