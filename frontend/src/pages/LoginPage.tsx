import { useState } from "react";
import { Button, Form, Container, Spinner, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

type LoginPageProps = {
    onLoginSuccess: (email: string) => void;
};

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false); //loading icon 
    const navigate = useNavigate();

    // const handleLogin = async (e: React.FormEvent) => {
    //     e.preventDefault();
    //     setError("");
    //     setLoading(true);

    //     //JWT handeling
    //     try {
    //         const response = await fetch("http://localhost:8080/api/auth/login", {
    //             method: "POST",
    //             headers: {
    //                 "Content-Type": "application/json",
    //             },
    //             body: JSON.stringify({ email, password }),
    //         });

    //         const data = await response.json();

    //         if (!response.ok) {
    //             throw new Error(data.message || "Login failed");
    //         }

    //         // localStorage.setItem("token", data.token);
    //         navigate("/chat"); // can be home page
    //     } catch (err: any) {
    //         setError("Login failed!");
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);
    
        try {
            const response = await fetch(`http://localhost:8080/users?email=${encodeURIComponent(email)}`);
            const data = await response.json();
    
            if (!response.ok) {
                throw new Error(data.message || "Login failed");
            }
            
            onLoginSuccess(email);

            navigate("/my_profile"); 
        } catch (err: any) {
            setError("Login failed!");
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
        </Container>
    );
};

export default LoginPage;