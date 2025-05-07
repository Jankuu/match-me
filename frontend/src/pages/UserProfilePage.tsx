import { useState, useEffect } from "react";
import { Container, Button, Spinner } from "react-bootstrap";
import { FaEdit } from "react-icons/fa";
import axios from "axios";
import ProfileForm from "../components/profileForm/ProfileForm";
import ProfilePicture from "../components/profileForm/ProfilePicture";
import { Profile } from "../types/Profile";
import { useLocation, useParams } from 'react-router-dom';

const UserProfilePage = () => {
    const { identifier } = useParams<{ identifier: string }>();
    // const location = useLocation();

    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);

    useEffect(() => {
        if (!identifier) return; // if no identifier, don't load profile

        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('token');

                // check if the identifier is an email or a username
                const isEmail = identifier.includes('@');
                const queryParam = isEmail ? 'email' : 'username';

                const response = await axios.get<Profile>(
                    `http://localhost:8080/users?${queryParam}=${encodeURIComponent(identifier)}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );
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
    }, [identifier]);

    const handleChange = (field: keyof Profile["profile"], value: any) => {
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
            const token = localStorage.getItem('token');

            const isEmail = identifier?.includes('@') ?? false;
            const queryParam = isEmail ? 'email' : 'username';

            await axios.patch(
                `http://localhost:8080/users?${queryParam}=${encodeURIComponent(identifier as string)}`,
                profile,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

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

    if (!profile) {
        return (
            <Container className="mt-5 text-center">
                <p>Profile not found.</p>
            </Container>
        );
    }

    return (
        <Container className="mt-5" style={{ maxWidth: "600px" }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>My Profile</h2>
                <Button variant="outline-primary" onClick={() => setEditing(!editing)}>
                    <FaEdit /> {editing ? "Cancel" : "Edit"}
                </Button>
            </div>

            <ProfilePicture profilePicture={profile.profile.profilePicture} />

            <ProfileForm
                profile={profile}
                editing={false}
                onChange={handleChange}
                onSave={handleSave}
            />
        </Container>
    );
};

export default UserProfilePage;
