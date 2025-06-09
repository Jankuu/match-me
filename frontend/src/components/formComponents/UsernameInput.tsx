import { useEffect } from "react"; // Import useEffect for side effects (like calling a validation callback)
import { Form, InputGroup } from "react-bootstrap"; // Importing Form and InputGroup components from React-Bootstrap
import { CheckCircleFill, XCircleFill } from "react-bootstrap-icons"; // Importing icon components for validation feedback

/**
 * Props for the UsernameInput component.
 * @param value The current value of the username input field.
 * @param onChange Callback function to update the username state in the parent component.
 * @param onValidate Callback function to inform the parent component about the validation status.
 * @param disabled Boolean indicating if the input should be disabled (e.g., when form is submitting).
 */
type Props = {
    value: string;
    onChange: (value: string) => void;
    onValidate: (isValid: boolean) => void;
    disabled: boolean;
};

/**
 * UsernameInput component.
 * This component provides an input field for the username,
 * along with real-time client-side validation feedback.
 */
const UsernameInput = ({ value, onChange, onValidate, disabled }: Props) => {
    // Determine if the username is long enough (i.e., not empty after trimming whitespace).
    const isLongEnough = value.trim().length > 0;
    // 'structureValid' is currently always true, which means there are no regex or specific format rules applied yet.
    // This could be a placeholder for future, more complex username validation rules.
    const structureValid = true;
    // Overall validation status: the username is valid if it's long enough and meets structural requirements.
    const nameValid = isLongEnough && structureValid;

    /**
     * useEffect hook to notify the parent component about the validation status.
     * This effect runs whenever 'value' (the input text) changes, or when 'nameValid' changes.
     * It calls the 'onValidate' prop with the current 'nameValid' status.
     * 'onValidate' is included in the dependency array as recommended by React for useCallback/memoized functions.
     */
    useEffect(() => {
        onValidate(nameValid);
    }, [value, nameValid, onValidate]); // Dependencies: value, nameValid, onValidate callback

    return (
        <Form.Group className="mb-3">
            <Form.Label>
                Username{" "}
                {/* Optional: Add a red asterisk here if username is a required field */}
                {/* <span style={{ color: "red" }}>*</span> */}
            </Form.Label>
            <InputGroup>
                <Form.Control
                    type="text" // Specifies input type as text
                    value={value} // Binds input value to the 'value' prop
                    onChange={(e) => onChange(e.target.value)} // Updates parent's state on input change
                    placeholder="Enter your username" // Placeholder text
                    // Optional: Add 'required' attribute if username is mandatory for browser-level validation
                    // required
                    disabled={disabled} // Disables input if 'disabled' prop is true
                    // Sets Bootstrap's 'isInvalid' class for visual feedback if value is empty.
                    // This mirrors the 'isLongEnough' check for displaying error.
                    isInvalid={value.length < 1}
                />
                <InputGroup.Text>
                    {/* Conditional rendering for validation icons */}
                    {value && ( // Only show icon if username input is not empty
                        nameValid ? ( // If username is valid (long enough and structurally valid)
                            <CheckCircleFill color="green" /> // Show green check icon
                        ) : (
                            <XCircleFill color="red" /> // Show red X icon
                        )
                    )}
                </InputGroup.Text>
            </InputGroup>

            {/* Conditional rendering for validation feedback text */}
            {value.length < 1 && ( // Show message if username is empty
                <Form.Text className="text-danger d-block">
                    Username must be more than 1 character long. {/* Error message */}
                </Form.Text>
            )}
        </Form.Group>
    );
};

export default UsernameInput; // Export the UsernameInput component