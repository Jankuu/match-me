import { useState, useEffect } from "react";
import { Container, Form, Button, Spinner } from "react-bootstrap";
import { FaEdit } from "react-icons/fa"; // Pencil icon
import axios from "axios";

type Profile = {
    username: string;
    email: string;
    profile: {
        name: string;
        profilePicture: string;
        birthDate: string;
        gender: string;
        height: number;
        description: string;
        location?: string;
    };
    interestedMinAge: number;
    interestedMaxAge: number;
    interestedGenders: string[];
    interestVector: {
        fantasy: number;
        competitive: number;
        action: number;
        story: number;
        complex: number;
    };
};

const ProfilePage = () => {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get<Profile>("http://localhost:8080/users/me", {
                    headers: {
                        Authorization: `Bearer ${token}`, // Add the token in the header
                    },
                });
                setProfile(response.data);
            } catch (error) {
                console.error("Failed to load profile", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

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
            const token = localStorage.getItem("token");
            await axios.put(
                "http://localhost:8080/users/me",
                profile,
                {
                    headers: {
                        Authorization: `Bearer ${token}`, // Add the token in the header
                    },
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

            <Form>
                <Form.Group className="mb-3">
                    <Form.Label>Username</Form.Label>
                    <Form.Control type="text" value={profile.username} disabled />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control type="email" value={profile.email} disabled />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Birth Date</Form.Label>
                    <Form.Control type="date" value={profile.profile.birthDate} disabled />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Gender</Form.Label>
                    <Form.Control
                        type="text"
                        value={profile.profile.gender}
                        disabled={!editing}
                        onChange={(e) => handleChange("gender", e.target.value)}
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Height (cm)</Form.Label>
                    <Form.Control
                        type="number"
                        value={profile.profile.height}
                        disabled={!editing}
                        onChange={(e) => handleChange("height", Number(e.target.value))}
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Location</Form.Label>
                    <Form.Control
                        type="text"
                        value={profile.profile.location || ""}
                        disabled={!editing}
                        onChange={(e) => handleChange("location", e.target.value)}
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={3}
                        value={profile.profile.description}
                        disabled={!editing}
                        onChange={(e) => handleChange("description", e.target.value)}
                    />
                </Form.Group>

                {editing && (
                    <Button variant="success" onClick={handleSave}>
                        Save Changes
                    </Button>
                )}
            </Form>
        </Container>
    );
};

export default ProfilePage;
