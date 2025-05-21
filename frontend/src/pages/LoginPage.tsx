import { useState, useEffect } from "react";
import { Button, Form, Container, Spinner, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import {getUserIdentifierFromToken, isAuthenticated} from "../utils/auth";

type LoginPageProps = {
    onLoginSuccess: (identifier: string) => void;
};

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
    const [token, setToken] = useState(null);
    const [usernameOrEmail, setUsernameOrEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false); //loading icon 
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
      
          const token = data.token;
          localStorage.setItem("token", token);
          setToken(token);
      
          const userResponse = await fetch("http://localhost:8080/users/me", {
            headers: {
              "Authorization": `Bearer ${token}`,
            },
          });
      
          const userData = await userResponse.json();
      
          if (!userResponse.ok) {
            throw new Error(userData.message || "Failed to fetch user");
          }
      
          localStorage.setItem("user", JSON.stringify(userData));

          // Call the onLoginSuccess callback with the user identifier
          const identifier = getUserIdentifierFromToken();
          if (identifier) {
            onLoginSuccess(identifier);
          }

          setUsernameOrEmail("");
          setPassword("");
          console.log("navigating to /matching")
          navigate("/matching");
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
