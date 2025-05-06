import { useState, useEffect } from "react";
import { Container, Button, Spinner } from "react-bootstrap";
import { FaEdit } from "react-icons/fa";
import axios from "axios";
import ProfileForm from "../components/profileForm/ProfileForm";
import ProfilePicture from "../components/profileForm/ProfilePicture";
import { User } from "../types/User";
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from "react-bootstrap-icons";

const UserProfilePage = () => {
    const { id, email } = useParams();
    let param: string;
   
    const currentUserEmail = localStorage.getItem("email");
    const navigate = useNavigate();
    
    const identifier = id || email;
    const type = id ? "id" : "email";
    // const location = useLocation();

    const [profile, setProfile] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);

    useEffect(() => {
        if (!type) return;

        if (type === "email" && identifier) {
            param = "email=" + encodeURIComponent(identifier);
        } else if (type === "id" && identifier) {
            param = "id=" + identifier;
        }

        const fetchProfile = async () => {

            try {
                const response = await axios.get<User>(`http://localhost:8080/users?${param}`);
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
    }, [email]);

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
            await axios.patch("http://localhost:8080/users/me", profile);
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
        <>
        <div className="px-3 pt-3">
                        <Button
                            // variant="link"
                            onClick={() => navigate("/matching")}
                            className="d-flex align-items-center"
                        >
                            <ArrowLeft size={20} className="me-1" />
                            {/* Back */}
                        </Button>
                    </div>
        <Container className="mt-5" style={{ maxWidth: "600px" }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
            <   h2>{currentUserEmail === profile.email ? "My Profile" : `${profile.username}'s Profile`}</h2>
                {profile.email === currentUserEmail && (
                <Button variant="outline-primary" onClick={() => setEditing(!editing)}>
                    <FaEdit /> {editing ? "Cancel" : "Edit"}
                </Button>
            )}
            </div>

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
