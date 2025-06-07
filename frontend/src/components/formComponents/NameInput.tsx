import { useEffect } from "react"; // Import useEffect for side effects (like calling a validation callback)
import { Form, InputGroup } from "react-bootstrap"; // Importing Form and InputGroup components from React-Bootstrap
import { CheckCircleFill, XCircleFill } from "react-bootstrap-icons"; // Importing icon components for validation feedback

/**
 * Props for the NameInput component.
 * @param value The current value of the name input field.
 * @param onChange Callback function to update the name state in the parent component.
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
 * NameInput component.
 * This component provides an input field for the user's name,
 * along with real-time client-side validation feedback.
 */
const NameInput = ({ value, onChange, onValidate, disabled }: Props) => {
    /**
     * Helper function to validate the structure of the name.
     * A valid name is considered to be one where:
     * - Each part (separated by spaces or hyphens) starts with a capital letter.
     * - Each part contains only letters (A-Z, a-z).
     * @param name The string value of the name to validate.
     * @returns True if the structure is valid, false otherwise.
     */
    const isStructureValid = (name: string) => {
        // Trim whitespace and split the name by spaces or hyphens (e.g., "John Doe" -> ["John", "Doe"]; "Mary-Ann" -> ["Mary", "Ann"]).
        const parts = name.trim().split(/[- ]/);
        // Check if every part matches the regex pattern: starts with an uppercase letter, followed by zero or more lowercase letters.
        return parts.every((part) => /^[A-Z][a-z]*$/.test(part));
    };

    // Derived state: Is the name long enough (more than 1 character after trimming)?
    const isLongEnough = value.trim().length > 1;
    // Derived state: Is the name's structure valid based on the `isStructureValid` helper function?
    const structureValid = isStructureValid(value);
    // Overall validation status: the name is valid if it's long enough AND its structure is valid.
    const isUsernameValid = isLongEnough && structureValid; // Note: 'isUsernameValid' here refers to the 'name' field's validity.

    /**
     * useEffect hook to report the current validation status to the parent component.
     * This effect runs whenever 'value' (the input text) changes, or when 'isUsernameValid' changes.
     * It calls the 'onValidate' prop with the current validation status.
     * 'onValidate' is included in the dependency array as recommended by React for useCallback/memoized functions.
     */
    useEffect(() => {
        onValidate(isUsernameValid);
    }, [value, isUsernameValid, onValidate]); // Dependencies: value, isUsernameValid, onValidate callback

    return (
        <Form.Group className="mb-3">
            <Form.Label>
                Name{" "}
                {/* Optional: Add a red asterisk here if name is a required field. */}
                {/* This section was commented out in the original code, but often useful for required fields. */}
                {/* {!disabled && (<span style={{ color: "red" }}>*</span>)} */}
            </Form.Label>
            <InputGroup>
                <Form.Control
                    type="text" // Specifies input type as text
                    value={value} // Binds input value to the 'value' prop
                    onChange={(e) => onChange(e.target.value)} // Updates parent's state on input change
                    placeholder="Enter your name" // Placeholder text
                    // Optional: Add 'required' attribute if name is mandatory for browser-level validation
                    // required
                    disabled={disabled} // Disables input if 'disabled' prop is true
                    // Sets Bootstrap's 'isInvalid' class for visual feedback.
                    // The input is marked invalid if it's not empty AND it's not valid overall.
                    isInvalid={value.length > 0 && !isUsernameValid}
                />
                {/* Conditionally render the validation icon group. It's hidden if the input is disabled. */}
                {!disabled && (
                    <InputGroup.Text>
                        {/* Conditional rendering for validation icons */}
                        {value && ( // Only show icon if the name input is not empty
                            isUsernameValid ? ( // If the name is valid (long enough and structurally valid)
                                <CheckCircleFill color="green" /> // Show green check icon
                            ) : (
                                <XCircleFill color="red" /> // Show red X icon
                            )
                        )}
                    </InputGroup.Text>
                )}
            </InputGroup>

            {/* Conditional rendering for validation feedback messages */}
            {/* Show structure hint if the name is not structurally valid */}
            {value.length > 0 && !structureValid && (
                <Form.Text className="text-danger d-block">
                    Name must start with a capital letter and can contain only letters, spaces or hyphens.
                </Form.Text>
            )}

            {/* Show length hint if the name is too short (empty or only 1 character) */}
            {value.length > 0 && !isLongEnough && (
                <Form.Text className="text-danger d-block">
                    Name must be more than 1 character long.
                </Form.Text>
            )}
        </Form.Group>
    );
};

export default NameInput; // Export the NameInput component