import { useState } from "react";
import { Button, Form, Container, Alert, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const RegisterPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");
    // TODO: add positions related with matching
    const [image, setImage] = useState<File | null>(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append("email", email);
            formData.append("password", password);
            formData.append("username", username);
            if (image) formData.append("image", image);

            const response = await fetch("/api/auth/register", {  //TODO: type right path
                method: "POST",
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Registration failed");
            }

            navigate("/login");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="mt-5" style={{ maxWidth: "500px" }}>
            <h2 className="mb-4">Register</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form onSubmit={handleRegister}>
                <Form.Group className="mb-3">
                    <Form.Label>Username</Form.Label>
                    <Form.Control
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        disabled={loading}
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
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
                <Form.Group className="mb-3">
                    <Form.Label>Profile Image</Form.Label>
                    <Form.Control
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                            const target = e.target as HTMLInputElement; // need for TS to point that here we have files
                            setImage(target.files?.[0] || null);
                          }}
                        disabled={loading}
                    />
                </Form.Group>
                <Button variant="success" type="submit" disabled={loading}>
                    {loading ? (<><Spinner animation="border" size="sm" /> Creating...</>) : "Create Account"}
                </Button>
                <Button
                    variant="link"
                    onClick={() => navigate("/login")}
                    className="ms-2"
                    disabled={loading}
                >
                    Back to login
                </Button>
            </Form>
        </Container>
    );
};

export default RegisterPage;