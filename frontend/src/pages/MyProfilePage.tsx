import { useState, useEffect } from "react";
import { Container, Button, Spinner } from "react-bootstrap";
import { FaEdit } from "react-icons/fa";
import ProfileForm from "../components/profileForm/ProfileForm";
import ProfilePicture from "../components/profileForm/ProfilePicture";
import { Profile } from "../types/Profile";
import { getUserIdentifierFromToken } from "../utils/auth";
import apiClient from "../utils/apiClient";


const MyProfilePage = ({ userIdentifier }: { userIdentifier: string }) => {


    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
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

                const response = await apiClient.get<Profile>(
                    `/users?${queryParam}=${encodeURIComponent(identifier)}`
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
            const identifier = userIdentifier || getUserIdentifierFromToken();

            if (!identifier) {
                console.error("No identifier provided and none found in JWT token");
                return;
            }

            const isEmail = identifier.includes('@');
            const queryParam = isEmail ? 'email' : 'username';

            await apiClient.patch(
                `/users?${queryParam}=${encodeURIComponent(identifier)}`,
                profile
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
