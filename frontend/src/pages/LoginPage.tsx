import { useState } from "react";
import { Button, Form, Container, Spinner, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

type LoginPageProps = {
    onLoginSuccess: (identifier: string) => void;
};

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
    const [usernameOrEmail, setUsernameOrEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false); //loading icon 
    const navigate = useNavigate();

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
                    password 
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Login failed");
            }

            // Store the JWT token in localStorage
            localStorage.setItem("token", data.token);

            // Pass user data to parent component
            onLoginSuccess(data.user.email || data.user.username);

            navigate(`/matching`); // Need to be autorized and request matching stuff
        } catch (err: any) {
            setError("Invalid username/email or password");
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
                    {loading ? (<><Spinner animation="border" size="sm" /> Logging in...</>) : "Login"}
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
