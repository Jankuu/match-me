import React from "react"; // Importing React for component creation
import Form from "react-bootstrap/Form"; // Importing Form components from React-Bootstrap

/**
 * Defines the props for the Description component.
 *
 * @property {string} description - The current text value of the description. This makes it a controlled component.
 * @property {(description: string) => void} setDescription - A callback function to update the description in the parent component.
 */
interface DescriptionInputProps {
    description: string;
    setDescription: (description: string) => void;
}

/**
 * The Description component provides a multi-line text input field (textarea) for user descriptions.
 * It enforces a character limit and displays a real-time character count.
 */
const Description: React.FC<DescriptionInputProps> = ({ description, setDescription }) => {
    /**
     * Handles changes to the textarea input.
     * It updates the description state in the parent component only if the input length
     * does not exceed 300 characters.
     *
     * @param {React.ChangeEvent<HTMLTextAreaElement>} e - The change event from the textarea.
     */
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        // Check if the new input value's length is within the allowed limit (300 characters).
        if (e.target.value.length <= 300) {
            // If within limit, update the description state in the parent component.
            setDescription(e.target.value);
        }
        // If the length exceeds 300, the setDescription function is not called,
        // effectively preventing the user from typing more characters.
    };

    return (
        // Form.Group is a Bootstrap component for structuring form fields, providing proper spacing.
        <Form.Group className="mb-3" controlId="formDescription">
            {/* Form.Label provides an accessible label for the textarea. */}
            <Form.Label>Description</Form.Label>

            {/* Form.Control renders the textarea input field. */}
            <Form.Control
                as="textarea" // Renders an HTML <textarea> element.
                rows={3} // Sets the initial visible number of lines for the textarea.
                placeholder="Tell us something about yourself..." // Placeholder text for the input field.
                value={description} // Binds the textarea's value to the 'description' prop, making it a controlled component.
                onChange={handleChange} // Calls the handleChange function whenever the textarea content changes.
            />

            {/* Form.Text provides additional helper text, here used for character count. */}
            <Form.Text muted>
                {description.length}/300 characters {/* Displays the current character count against the max limit. */}
            </Form.Text>
        </Form.Group>
    );
};

export default Description; // Exports the Description component for use in other parts of the application.