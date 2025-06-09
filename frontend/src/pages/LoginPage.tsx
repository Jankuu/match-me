import { useState, useEffect, use } from "react";
import { Button, Form, Container, Spinner, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { getUserIdentifierFromToken, isAuthenticated } from "../utils/auth";
import "../styles/ColorPallette.css";

// Assuming you have a User type defined somewhere like this:
// import { User } from "../types/User";
// If not, you'll need to create it to match your UserDTO structure.
// For now, I'll use a basic interface that matches the expected fields here.
interface User {
    id: number;
    username: string;
    email: string;
    // Add other fields from your UserDTO that you expect to use
    // For nested objects like 'profile', define them as well:
    profile: {
        id: number | null;
        name: string | null;
        birthDate: string | null;
        gender: string | null;
        height: number | null;
        description: string | null;
        profilePicture: string | null;
    };
    interestedMinAge: number | null;
    interestedMaxAge: number | null;
    interestedGenders: string[] | null;
    interestedGames: any[] | null; // Use the actual Game type if imported
    radius: number | null;
    // ... any other fields you might use
}

type LoginPageProps = {
    onLoginSuccess: (identifier: string) => void;
};

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
    const [token, setToken] = useState<string | null>(null); // Explicitly type token as string | null
    const [usernameOrEmail, setUsernameOrEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // If user is already authenticated, redirect to matching page
        if (isAuthenticated()) {
            navigate("/matching");
        }
    }, [navigate]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await fetch("http://localhost:8080/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    usernameOrEmail,
                    password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Login failed");
            }

            const receivedToken: string = data.token; // Explicitly type it
            localStorage.setItem("token", receivedToken);
            setToken(receivedToken);

            // --- CRITICAL IMPROVEMENT: NULL HANDLING FOR USER DATA ---
            const user: User = data.user; // Assume data.user matches your User type
            const processedUser: User = {
                ...user,
                // Handle profile fields (nested object)
                profile: {
                    id: user.profile?.id || -1,
                    name: user.profile?.name || "", // Default to empty string
                    birthDate: user.profile?.birthDate || "", // Default to empty string
                    gender: user.profile?.gender || "man", // Default to a reasonable default like 'man'
                    height: user.profile?.height || 170, // Default height
                    description: user.profile?.description || "", // Default to empty string
                    profilePicture: user.profile?.profilePicture || "", // Default to empty string
                },
                // Handle root-level fields
                interestedMinAge: user.interestedMinAge || 18, // Default min age
                interestedMaxAge: user.interestedMaxAge || 99, // Default max age
                interestedGenders: user.interestedGenders || [], // Default to empty array
                interestedGames: user.interestedGames || [], // Default to empty array
                radius: user.radius || 5000, // Default radius
                // Ensure other fields that might be null are handled if they are critical for frontend
                // For example, if location or connections could be null and break something:
                // location: user.location || null, // If you really expect null sometimes
                // connectionRequests: user.connectionRequests || [],
                // connections: user.connections || [],
                // recommendedUserProfiles: user.recommendedUserProfiles || [],
            };

            localStorage.setItem("user", JSON.stringify(processedUser));
            // --- END CRITICAL IMPROVEMENT ---

            const identifier = getUserIdentifierFromToken();
            if (identifier) {
                onLoginSuccess(identifier);
            }

            setUsernameOrEmail("");
            setPassword("");

            // This line seems redundant if you already have the identifier check above.
            // If data.user.identifier is guaranteed to exist and is the desired identifier, keep it.
            // Otherwise, prefer the getUserIdentifierFromToken() logic.
            // For now, I'll assume data.user.identifier is the primary one for this call.
            onLoginSuccess(data.user.identifier);
        } catch (err: any) {
            setError("Invalid username/email or password");
            console.error("Login error:", err); // Log the full error for debugging
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="mt-5" style={{ maxWidth: "400px" }}>
            <h2 className="mb-4">Login</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form onSubmit={handleLogin}>
                <Form.Group className="mb-3">
                    <Form.Label>Email or Username</Form.Label>
                    <Form.Control
                        type="text"
                        value={usernameOrEmail}
                        onChange={(e) => setUsernameOrEmail(e.target.value)}
                        required
                        disabled={loading}
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={loading}
                    />
                </Form.Group>
                <Button variant="primary" type="submit" disabled={loading}>
                    {loading ? (
                        <>
                            <Spinner animation="border" size="sm" /> Logging
                            in...
                        </>
                    ) : (
                        "Login"
                    )}
                </Button>
                <Button
                    variant="link"
                    onClick={() => navigate("/register")}
                    className="ms-2"
                    disabled={loading}
                >
                    Sign up
                </Button>
            </Form>
            <div className="mt-4 text-center">
                <small className="text-muted">For developers:</small>
                <br />
                <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => navigate("/jwt-test")}
                    className="mt-1"
                >
                    JWT Authentication Test Page
                </Button>
            </div>
        </Container>
    );
};

export default LoginPage;
