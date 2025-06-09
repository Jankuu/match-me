import { Form, InputGroup } from "react-bootstrap"; // Importing Form and InputGroup components from React-Bootstrap
import { CheckCircleFill, XCircleFill } from "react-bootstrap-icons"; // Importing icon components for validation feedback

/**
 * Props for the EmailInput component.
 * @param email The current value of the email input field.
 * @param repeatedEmail The current value of the repeated email input field.
 * @param setEmail Callback function to update the email state.
 * @param setRepeatedEmail Callback function to update the repeated email state.
 * @param loading Boolean indicating if the form is in a loading state (e.g., submitting), to disable inputs.
 */
type Props = {
    email: string;
    repeatedEmail: string;
    setEmail: (value: string) => void;
    setRepeatedEmail: (value: string) => void;
    loading: boolean;
};

/**
 * EmailInput component.
 * This component provides two input fields for email and repeated email,
 * along with real-time client-side validation feedback.
 */
const EmailInput = ({ email, repeatedEmail, setEmail, setRepeatedEmail, loading }: Props) => {
    // Regex for basic email format validation.
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    return (
        <>
            {/* Form Group for the primary Email input */}
            <Form.Group className="mb-3">
                <Form.Label>
                    Email <span style={{ color: "red" }}>*</span> {/* Label for the email input with a required indicator */}
                </Form.Label>
                <InputGroup>
                    <Form.Control
                        type="email" // Specifies input type as email for browser validation and keyboard
                        value={email} // Binds input value to the 'email' state
                        onChange={(e) => setEmail(e.target.value)} // Updates 'email' state on input change
                        disabled={loading} // Disables input if 'loading' is true
                        // Sets Bootstrap's 'isInvalid' class for visual feedback based on validation
                        isInvalid={email.length > 0 && !isEmailValid}
                    />
                    <InputGroup.Text>
                        {/* Conditional rendering for validation icons */}
                        {email ? ( // Only show icon if email input is not empty
                            isEmailValid ? ( // If email format is valid
                                <CheckCircleFill color="green" /> // Show green check icon
                            ) : (
                                <XCircleFill color="red" /> // Show red X icon
                            )
                        ) : null} {/* If email is empty, show nothing */}
                    </InputGroup.Text>
                </InputGroup>
                {/* Conditional rendering for validation feedback text */}
                {email.length > 0 && !isEmailValid && (
                    <Form.Text className="text-danger">
                        Email must be valid (e.g., user@example.com) {/* Error message */}
                    </Form.Text>
                )}
            </Form.Group>

            {/* Form Group for the Repeated Email input */}
            <Form.Group className="mb-3">
                <Form.Label>
                    Repeat Email <span style={{ color: "red" }}>*</span> {/* Label for repeated email with required indicator */}
                </Form.Label>
                <InputGroup>
                    <Form.Control
                        type="email" // Input type email
                        value={repeatedEmail} // Binds input value to 'repeatedEmail' state
                        onChange={(e) => setRepeatedEmail(e.target.value)} // Updates 'repeatedEmail' state on input change
                        // Disables input if 'loading' is true OR if the initial email is not valid (prevents entering repeated email if first is bad)
                        disabled={loading || !isEmailValid}
                        // Sets Bootstrap's 'isInvalid' class based on whether repeated email is entered and doesn't match the first email
                        isInvalid={repeatedEmail.length > 0 && repeatedEmail !== email}
                    />
                    <InputGroup.Text>
                        {/* Conditional rendering for validation icons */}
                        {repeatedEmail ? ( // Only show icon if repeated email input is not empty
                            repeatedEmail === email ? ( // If repeated email matches the first email
                                <CheckCircleFill color="green" /> // Show green check icon
                            ) : (
                                <XCircleFill color="red" /> // Show red X icon
                            )
                        ) : null} {/* If repeated email is empty, show nothing */}
                    </InputGroup.Text>
                </InputGroup>
            </Form.Group>
        </>
    );
};

export default EmailInput; // Export the EmailInput component as the default export