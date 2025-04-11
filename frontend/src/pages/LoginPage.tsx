// LoginPage.tsx
import React, { useState } from "react";
import { Form, Button, Container, Alert } from "react-bootstrap";

interface Props {
    onLogin: () => void;
}

const LoginPage: React.FC<Props> = ({ onLogin }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isRegistering, setIsRegistering] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isRegistering) {
            if (password !== confirmPassword) {
                setError('Wrong password!');
                return;
            }
            // TODO: request for registration
            console.log('Registering: ', { email, password});
            onLogin();
        } else {
            // TODO: request for login
            console.log('Logging in: ', { email, password });
        
            // Here will be real request
            if (email === "test@example.com" && password === "123456") {
                onLogin(); // 👈 inform App that client is authorized
                setError(null);
            } else {
                setError("Wrong login or password");
            }
        }
    };

    const toggleForm = () => {
        setIsRegistering(!isRegistering);
        setError(null);
        setEmail("");
        setPassword("");
        setConfirmPassword("");
    };

    return (
        <Container style={{ maxWidth: "400px", marginTop: "100px" }}>
            <h2 className="mb-4">
                {isRegistering ? "Registration" : "Log in"}
            </h2>

            {error && <Alert variant="danger">{error}</Alert>}
            <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="formEmail">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                        type="email"
                        placeholder="example@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formPassword">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                        type="password"
                        placeholder="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </Form.Group>

                {isRegistering && (
                    // TODO: make a separate registartion page
                    <Form.Group className="mb-3" controlId="formConfirmPassword">
                        <Form.Label>Confirm password</Form.Label>
                        <Form.Control
                            type="password"
                            placeholder="your password again please"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </Form.Group>

                )}

                <Button variant="primary" type="submit" className="w-100">
                    {isRegistering ? "Register an account" : "Log in"}
                </Button>
                <Button
                    variant="link"
                    onClick={toggleForm}
                    className="w-100"
                    style={{ textDecoration: "none" }}
                >
                    {isRegistering
                        ? "Already hav an account? Login"
                        : "A new one? Register here"}
                </Button>
            </Form>
        </Container>
    );
};

export default LoginPage;
