import { useState, useEffect } from "react";
import { Container, Button, Spinner } from "react-bootstrap";
import { FaEdit } from "react-icons/fa";
import axios from "axios";
import ProfileForm from "../components/profileForm/ProfileForm";
import ProfilePicture from "../components/profileForm/ProfilePicture";
import { Profile } from "../types/Profile";
import { getUserIdentifierFromToken } from "../utils/auth";


const MyProfilePage = ({ userIdentifier }: { userIdentifier: string }) => {


    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                // Use identifier from props or fallback to JWT token
                const identifier = userIdentifier || getUserIdentifierFromToken();

                if (!identifier) {
                    console.error("No identifier provided and none found in JWT token");
                    setLoading(false);
                    return;
                }

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
    }, [userIdentifier]);

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
            // Use identifier from props or fallback to JWT token
            const identifier = userIdentifier || getUserIdentifierFromToken();

            if (!identifier) {
                console.error("No identifier provided and none found in JWT token");
                return;
            }

            // Check if the identifier is an email (contains @) or a username
            const isEmail = identifier.includes('@');
            const queryParam = isEmail ? 'email' : 'username';

            await axios.patch(
                `http://localhost:8080/users?${queryParam}=${encodeURIComponent(identifier)}`, 
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
                editing={editing}
                onChange={handleChange}
                onSave={handleSave}
            />
        </Container>
    );
};

export default MyProfilePage;
