import { useState, useEffect } from "react";
import { Container, Alert, Spinner, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import RegisterForm from "../components/registrationComponents/RegistrationForm";

const RegisterPage = () => {
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (formData: FormData) => {
        setError("");
        setLoading(true);

        try {
            const response = await axios.post("http://localhost:8080/users/reg", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            if (response.status !== 200 && response.status !== 201) {
                throw new Error("Registration failed");
            }

            navigate("/login");
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="mt-5" style={{ maxWidth: "500px" }}>
            <h2 className="mb-4">Registration</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            <RegisterForm onSubmit={handleSubmit} loading={loading} />
            <Button variant="link" onClick={() => navigate("/login")} className="mt-3" disabled={loading}>
                Back to login
            </Button>
        </Container>
    );
};

export default RegisterPage;
