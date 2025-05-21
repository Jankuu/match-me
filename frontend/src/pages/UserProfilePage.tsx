import React, { useState, useEffect, useMemo } from "react";
import { Container, Button, Spinner } from "react-bootstrap";
import { FaEdit } from "react-icons/fa";
import ProfileForm from "../components/profileForm/ProfileForm";
import ProfilePicture from "../components/profileForm/ProfilePicture";
import { User } from "../types/User";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "react-bootstrap-icons";
import apiClient from "../utils/apiClient";

const UserProfilePage = () => {
    const { identifier } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    // Memoize currentUser to avoid creating a new object on every render
    const currentUser = useMemo(() => {
        const storedUser = localStorage.getItem("user");
        return storedUser ? (JSON.parse(storedUser) as User) : null;
    }, []);

    const isUsername = location.pathname.includes("/username/");
    const isId = location.pathname.includes("/id/");

    const [profile, setProfile] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);

    useEffect(() => {
        if (!identifier) return;

        // Check if requested profile is own profile
        const isOwnProfile =
            currentUser &&
            ((isUsername && currentUser.username === identifier) ||
                (isId && String(currentUser.id) === identifier));

        if (isOwnProfile && currentUser) {
            // Load profile from localStorage
            if (
                currentUser.profile.profilePicture &&
                !currentUser.profile.profilePicture.startsWith("data:image")
            ) {
                currentUser.profile.profilePicture = `data:image/jpeg;base64,${currentUser.profile.profilePicture}`;
            }
            setProfile(currentUser);
            setLoading(false);
        } else {
            // Load profile from server
            const param = isUsername
                ? `username=${identifier}`
                : isId
                ? `id=${identifier}`
                : "";

            if (!param) return;

        const fetchProfile = async () => {

            try {
                console.log(param);
                const response = await apiClient.get<User>(`/users?${param}`);
                const profileData = response.data;

                    const picture = profileData.profile.profilePicture;
                    if (picture && !picture.startsWith("data:image")) {
                        profileData.profile.profilePicture = `data:image/jpeg;base64,${picture}`;
                    }

                    setProfile(profileData);
                } catch (error) {
                    console.error("Failed to load profile", error);
                } finally {
                    setLoading(false);
                }
            };

            fetchProfile();
        }
    }, [identifier, isId, isUsername]); // currentUser removed from dependencies

    const handleChange = (field: keyof User["profile"], value: any) => {
        if (!profile) return;
        setProfile({
            ...profile,
            profile: {
                ...profile.profile,
                [field]: value,
            },
        });
    };

    const handleSave = async () => {
        try {
          if (!profile) return;
          await apiClient.patch("/users/profile", profile.profile); //
          setEditing(false);
        } catch (error) {
          console.error("Failed to save profile", error);
        }
      };
    // const handleSave = async () => {
    //     try {
    //         if (!profile?.id) return;
    //         await apiClient.patch(`/users/profile?id=${profile.id}`, profile.profile);
    //         setEditing(false);
    //     } catch (error) {
    //         console.error("Failed to save profile", error);
    //     }
    // };

    if (loading) {
        return (
            <Container className="mt-5 text-center">
                <Spinner animation="border" />
            </Container>
        );
    }

    if (!profile) {
        return (
            <Container className="mt-5 text-center">
                <p>Profile not found.</p>
            </Container>
        );
    }

    const isOwnProfile = currentUser && currentUser.username === profile.username;

    return (
        <>
            <div className="px-3 pt-3">
                <Button onClick={() => navigate("/matching")} className="d-flex align-items-center">
                    <ArrowLeft size={20} className="me-1" />
                </Button>
            </div>
            <Container className="mt-5" style={{ maxWidth: "600px" }}>
                <h2>{isOwnProfile ? "My Profile" : `${profile.username}'s Profile`}</h2>

                {isOwnProfile && (
                    <Button variant="outline-primary" onClick={() => setEditing(!editing)}>
                        <FaEdit /> {editing ? "Cancel" : "Edit"}
                    </Button>
                )}

                <ProfilePicture profilePicture={profile.profile.profilePicture} />

                <ProfileForm
                    profile={profile}
                    editing={editing}
                    onChange={handleChange}
                    onSave={handleSave}
                />
            </Container>
        </>
    );
};

export default UserProfilePage;
