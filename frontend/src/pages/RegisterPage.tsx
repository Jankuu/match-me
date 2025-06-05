import { useState } from "react";
import { Container, Alert, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import RegisterForm from "../components/forms/RegisterForm";
import { UserRegistrationDTO } from "../dto/UserRegistrationDTO";
import apiClient from "../utils/apiClient";
import axios from "axios"; // Good practice for type-guarding with axios.isAxiosError

const RegisterPage = () => {
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (userPayload: UserRegistrationDTO) => {
        setError("");
        setLoading(true);

        try {
            console.log(userPayload);
            const response = await apiClient.post(
                "/users/register",
                userPayload
            );

            // If the request is successful (2xx status), navigate to the login page.
            // If the server returns an error (e.g., 500), Axios will throw an exception
            // that will be caught by the catch block.
            navigate("/login");
        } catch (err: any) {
            // Now, `err.message` will contain "User with this username already exists"
            // or "An unexpected error occurred from the server."
            if (axios.isAxiosError(err)) {
                // If it's an Axios error, use its message property.
                // The interceptor has already taken care of selecting the best message.
                setError(err.message || "An unexpected network or server error occurred.");
            } else if (err instanceof Error) {
                // If it's a standard Error object (e.g., one created by the interceptor)
                setError(err.message || "Something went wrong (client-side or unknown error).");
            } else {
                // Handle any other unknown types of errors
                setError("An unknown error occurred.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="mt-5" style={{ maxWidth: "500px" }}>
            <h2 className="mb-4">Registration</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            <RegisterForm onSubmit={handleSubmit} loading={loading} />
            <Button
                variant="link"
                onClick={() => navigate("/login")}
                className="mt-3"
                disabled={loading}
            >
                Back to login
            </Button>
        </Container>
    );
};

export default RegisterPage;