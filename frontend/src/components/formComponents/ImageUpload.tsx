import { Form, Button } from "react-bootstrap"; // Importing Form and Button components from React-Bootstrap
import React from "react"; // Explicitly importing React

/**
 * Defines the props for the ImageUpload component.
 *
 * @property {File | null} image - The File object representing a newly selected image for upload. Null if no new image is selected.
 * @property {(file: File | null) => void} setImage - Callback function to update the `image` (newly selected file) state in the parent.
 * @property {boolean} disabled - Controls whether the file input and clear button are interactable (true to disable, false to enable).
 * @property {boolean} displayed - Controls whether the entire component is rendered at all. If false, the component returns null.
 * @property {() => void} onClearImage - Callback function to signal the parent that the image (either new or existing) should be cleared.
 * @property {string | null | undefined} currentProfilePicture - The Base64 string of the user's *existing* profile picture, or null/undefined if none.
 * This is used to determine if the "Clear Image" button should be visible.
 */
type Props = {
    image: File | null;
    setImage: (file: File | null) => void;
    disabled: boolean;
    displayed: boolean;
    onClearImage: () => void;
    currentProfilePicture: string | null | undefined;
};

/**
 * ImageUpload component.
 * Provides functionality for selecting a new profile image, displaying its name,
 * and allowing users to clear either a newly selected image or an existing profile picture.
 * The component's interactivity and visibility are controlled by props.
 */
const ImageUpload: React.FC<Props> = ({
    image, // Newly selected file from the input
    setImage, // Function to update the newly selected file
    disabled, // Controls interactivity
    displayed, // Controls visibility of the entire component
    onClearImage, // Function to clear the image (new or existing)
    currentProfilePicture, // Existing profile picture data (e.g., Base64 string)
}: Props) => {
    /**
     * Handles the change event of the file input.
     * If a file is selected, it calls `setImage` with the File object.
     * If the input is cleared (e.g., by cancelling file selection), it calls `setImage` with null.
     * @param {React.ChangeEvent<HTMLInputElement>} e - The change event from the file input.
     */
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Check if files were selected and if the first file exists.
        if (e.target.files && e.target.files[0]) {
            setImage(e.target.files[0]); // Set the selected file.
        } else {
            setImage(null); // Clear the selected file if nothing is chosen or the input is cleared.
        }
    };

    // If the 'displayed' prop is false, the component renders nothing.
    // This allows the parent component to conditionally hide or show this entire section.
    if (!displayed) {
        return null;
    }

    /**
     * Determines whether the "Clear Image" button should be visible.
     * The button is shown if:
     * 1. The component is NOT disabled (i.e., in an interactive mode).
     * 2. AND either a *new* image has been selected (`image` is not null)
     * 3. OR an *existing* profile picture exists (`currentProfilePicture` is not null/undefined).
     * This logic ensures the "Clear Image" button is relevant to the user's current state.
     */
    const showClearButton = !disabled && (image || currentProfilePicture);

    return (
        // Form.Group for proper form field layout and spacing.
        <Form.Group className="mb-3">
            <Form.Label>Profile Image</Form.Label>
            <Form.Control
                type="file" // Input type for file selection.
                accept="image/*" // Restrict file selection to image types.
                onChange={handleImageChange} // Event handler for file selection.
                disabled={disabled} // Disables the file input based on the 'disabled' prop.
            />

            {/* Conditionally display the name of the newly selected file. */}
            {image && <p>Selected new file: {image.name}</p>}

            {/* Conditionally display the "Clear Image" button based on `showClearButton` logic. */}
            {showClearButton && (
                <Button
                    variant="outline-danger" // Style as an outline danger button.
                    size="sm" // Small size button.
                    onClick={onClearImage} // Calls the parent's `onClearImage` function when clicked.
                    className="mt-2" // Add some top margin for spacing.
                    disabled={disabled} // Disables the button if the component is in a disabled state.
                >
                    Clear Image
                </Button>
            )}
        </Form.Group>
    );
};

export default ImageUpload; // Export the ImageUpload component for use elsewhere.