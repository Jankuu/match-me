import { Form, InputGroup } from "react-bootstrap"; // Importing Form and InputGroup components from React-Bootstrap
import { CheckCircleFill, XCircleFill } from "react-bootstrap-icons"; // Importing icon components for validation feedback

/**
 * Props for the PasswordInput component.
 * @param password The current value of the password input field.
 * @param repeatedPassword The current value of the repeated password input field.
 * @param setPassword Callback function to update the password state.
 * @param setRepeatedPassword Callback function to update the repeated password state.
 * @param loading Boolean indicating if the form is in a loading state, to disable inputs.
 */
type Props = {
    password: string;
    repeatedPassword: string;
    setPassword: (value: string) => void;
    setRepeatedPassword: (value: string) => void;
    loading: boolean;
};

/**
 * PasswordInput component.
 * This component provides two input fields for password and repeated password,
 * along with real-time client-side validation feedback based on strength rules and matching.
 */
const PasswordInput = ({ password, repeatedPassword, setPassword, setRepeatedPassword, loading }: Props) => {

    // Regex for password validation: at least 6 characters, at least one letter, and at least one digit.
    const isPasswordValid = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/.test(password);

    return (
        <>
            {/* Form Group for the primary Password input */}
            <Form.Group className="mb-3">
                <Form.Label>
                    Password <span style={{ color: "red" }}>*</span> {/* Label for the password input with a required indicator */}
                </Form.Label>
                <InputGroup>
                    <Form.Control
                        type="password" // Specifies input type as password for masked input
                        value={password} // Binds input value to the 'password' state
                        onChange={(e) => setPassword(e.target.value)} // Updates 'password' state on input change
                        placeholder="Enter password" // Placeholder text for the input
                        required // Marks the input as required for browser validation
                        disabled={loading} // Disables input if 'loading' is true
                        // Sets Bootstrap's 'isInvalid' class for visual feedback if password is not empty and invalid
                        isInvalid={password.length > 0 && !isPasswordValid}
                    />
                    <InputGroup.Text>
                        {/* Conditional rendering for validation icons */}
                        {password ? ( // Only show icon if password input is not empty
                            isPasswordValid ? ( // If password meets all strength requirements
                                <CheckCircleFill color="green" /> // Show green check icon
                            ) : (
                                <XCircleFill color="red" /> // Show red X icon
                            )
                        ) : null} {/* If password is empty, show nothing */}
                    </InputGroup.Text>
                </InputGroup>
                {/* Conditional rendering for password strength feedback messages */}
                {password.length > 0 && password.length < 6 && (
                    <Form.Text className="text-danger d-block">
                        Password must be at least 6 characters long
                    </Form.Text>
                )}
                {password.length > 0 && !/[0-9]/.test(password) && (
                    <Form.Text className="text-danger d-block">
                        Password must contain at least one number
                    </Form.Text>
                )}
                {password.length > 0 && !/[A-Za-z]/.test(password) && (
                    <Form.Text className="text-danger d-block">
                        Password must contain at least one letter
                    </Form.Text>
                )}
            </Form.Group>

            {/* Form Group for the Repeated Password input */}
            <Form.Group className="mb-3">
                <Form.Label>
                    Repeat Password <span style={{ color: "red" }}>*</span> {/* Label for repeated password with required indicator */}
                </Form.Label>
                <InputGroup>
                    <Form.Control
                        type="password" // Input type password
                        value={repeatedPassword} // Binds input value to 'repeatedPassword' state
                        onChange={(e) => setRepeatedPassword(e.target.value)} // Updates 'repeatedPassword' state on input change
                        placeholder="Repeat password" // Placeholder text
                        required // Marks as required
                        // Disables input if 'loading' is true OR if the first password is not valid (prevents entering repeated password if first is bad)
                        disabled={loading || !isPasswordValid}
                    />
                    <InputGroup.Text>
                        {/* Conditional rendering for matching icons */}
                        {password ? ( // Only show icon if primary password input is not empty
                            password === repeatedPassword ? ( // If passwords match
                                <CheckCircleFill color="green" /> // Show green check icon
                            ) : (
                                <XCircleFill color="red" /> // Show red X icon
                            )
                        ) : null} {/* If primary password is empty, show nothing */}
                    </InputGroup.Text>
                </InputGroup>
                {/* Conditional rendering for password mismatch feedback */}
                {password && repeatedPassword && password !== repeatedPassword && (
                    <Form.Text className="text-danger">Passwords do not match.</Form.Text>
                )}
            </Form.Group>
        </>
    );
};

export default PasswordInput; // Export the PasswordInput component