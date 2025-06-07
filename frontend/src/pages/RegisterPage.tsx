import { useState } from "react"; // Import React's useState hook for managing component state
import { Container, Alert, Button } from "react-bootstrap"; // Import Bootstrap components for UI layout, alerts, and buttons
import { useNavigate } from "react-router-dom"; // Import useNavigate hook from React Router for programmatic navigation
import RegisterForm from "../components/forms/RegisterForm"; // Import the RegisterForm component, which handles the registration input fields
import { UserRegistrationDTO } from "../dto/UserRegistrationDTO"; // Import the type definition for user registration data
import apiClient from "../utils/apiClient"; // Import the Axios instance configured for API requests (likely with interceptors)
import axios from "axios"; // Import the base Axios library, used here for `axios.isAxiosError` for type guarding

/**
 * RegisterPage component.
 * This component provides the user interface for registering a new account.
 * It manages the registration form submission, handles API calls, and displays feedback to the user.
 */
const RegisterPage = () => {
    // State to store any error messages to display to the user.
    const [error, setError] = useState("");
    // State to manage the loading status during API requests, used to disable form submission.
    const [loading, setLoading] = useState(false);
    // Hook to get the navigation function, allowing redirection after successful registration.
    const navigate = useNavigate();

    /**
     * Handles the submission of the registration form.
     * This asynchronous function sends the user's registration data to the backend API.
     * @param userPayload The data from the registration form, typed as UserRegistrationDTO.
     */
    const handleSubmit = async (userPayload: UserRegistrationDTO) => {
        // Clear any previous errors before a new submission attempt.
        setError("");
        // Set loading to true to indicate that an API request is in progress.
        setLoading(true);

        try {
            console.log(userPayload); // Log the payload for debugging purposes
            // Send a POST request to the '/users/register' endpoint with the user's data.
            // apiClient is an Axios instance, so it returns a Promise.
            const response = await apiClient.post(
                "/users/register",
                userPayload
            );

            // If the API request is successful (HTTP 2xx status code),
            // navigate the user to the login page, as registration is complete.
            navigate("/login");
        } catch (err: any) {
            // Catch block to handle any errors that occur during the API request.
            // This is crucial for providing user feedback on registration failures.
            if (axios.isAxiosError(err)) {
                // If the error is an Axios error, it means it's a network or server-side error.
                // The `apiClient`'s interceptor is expected to have processed the error
                // and set a user-friendly message on `err.message`.
                setError(err.message || "An unexpected network or server error occurred.");
            } else if (err instanceof Error) {
                // If the error is a standard JavaScript Error object (e.g., if a custom
                // error was thrown somewhere in the call stack before Axios), use its message.
                setError(err.message || "Something went wrong (client-side or unknown error).");
            } else {
                // Catch-all for any other unknown types of errors.
                setError("An unknown error occurred.");
            }
        } finally {
            // This block always executes after try...catch, regardless of success or failure.
            // Set loading back to false to re-enable the form submission button.
            setLoading(false);
        }
    };

    return (
        // Container for the registration page, with Bootstrap styling for centering and max-width.
        <Container className="mt-5" style={{ maxWidth: "500px" }}>
            <h2 className="mb-4">Registration</h2> {/* Page title */}
            {/* Conditionally render an Alert component if there's an error message. */}
            {error && <Alert variant="danger">{error}</Alert>}
            {/* Render the RegisterForm component, passing the handleSubmit function and loading state. */}
            <RegisterForm onSubmit={handleSubmit} loading={loading} />
            {/* Button to navigate back to the login page. */}
            <Button
                variant="link" // Renders as a link-styled button
                onClick={() => navigate("/login")} // Navigates to /login on click
                className="mt-3" // Adds top margin
                disabled={loading} // Disable the button while the form is submitting
            >
                Back to login
            </Button>
        </Container>
    );
};

export default RegisterPage; // Export the RegisterPage component as the default export