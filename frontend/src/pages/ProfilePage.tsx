// Page with picture and all data
// ProfilePage.tsx
import { useEffect, useState } from "react";
import { Container, Row, Col, Card, Spinner, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

interface UserProfile {
    username: string;
    email: string;
    imageUrl: string;
}

const ProfilePage = () => {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            navigate("/login");
            return;
        }

        // Simulate an API call
        const fetchUserProfile = async () => {
            try {
                const response = await fetch("/api/user/profile", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch profile");
                }

                const data = await response.json();

                setUser({
                    username: data.username,
                    email: data.email,
                    imageUrl: data.imageUrl || "/default-avatar.png",
                });
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, [navigate]);

    if (loading) {
        return (
            <Container className="text-center mt-5">
                <Spinner animation="border" />
            </Container>
        );
    }

    if (!user) {
        return (
            <Container className="text-center mt-5">
                <p>Failed to load profile.</p>
                <Button onClick={() => navigate("/login")}>Go to Login</Button>
            </Container>
        );
    }

    return (
        <Container className="mt-5">
            <Row className="justify-content-center">
                <Col md={6}>
                    <Card className="text-center">
                        <Card.Body>
                            <img
                                src={user.imageUrl}
                                alt="Profile"
                                className="rounded-circle mb-3"
                                style={{ width: "150px", height: "150px", objectFit: "cover" }}
                            />
                            <h4>{user.username}</h4>
                            <p>{user.email}</p>
                            <Button variant="primary" onClick={() => navigate("/chat")}>
                                Go to Chat
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default ProfilePage;
