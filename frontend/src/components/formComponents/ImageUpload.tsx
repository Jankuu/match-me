import { Form, Button } from "react-bootstrap";
import React from "react"; // Explicitly import React

type Props = {
    image: File | null; // This is the file currently selected for *upload*
    setImage: (file: File | null) => void; // Function to update the selected file for upload
    disabled: boolean; // Controls whether the file input is interactable
    displayed: boolean; // Controls whether the entire component is rendered
    // New prop: a function to signal the parent that the image should be cleared
    onClearImage: () => void;
    // New prop: the current profile picture string (Base64) from the user object
    // This is needed to decide if the "Clear Image" button should be visible.
    currentProfilePicture: string | null | undefined;
};

const ImageUpload = ({
    image,
    setImage,
    disabled,
    displayed,
    onClearImage,
    currentProfilePicture,
}: Props) => {
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setImage(e.target.files[0]);
        } else {
            setImage(null); // Clear image if nothing is selected or file input is cleared
        }
    };

    // If the component should not be displayed, return null
    if (!displayed) {
        return null;
    }

    // Determine if the clear button should be shown.
    // It should be shown if:
    // 1. The component is in editing mode (i.e., `displayed` is true)
    // 2. There is currently a selected *new* image (from `image` prop)
    // 3. OR, there is an existing profile picture loaded (from `currentProfilePicture` prop)
    const showClearButton = !disabled && (image || currentProfilePicture);


    return (
        <Form.Group className="mb-3">
            <Form.Label>Profile Image</Form.Label>
            <Form.Control
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                disabled={disabled} // Disable input if not in editing mode
            />
            {/* Display the name of the newly selected file */}
            {image && <p>Selected new file: {image.name}</p>}

            {/* Display the clear image button only when applicable */}
            {showClearButton && (
                <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={onClearImage}
                    className="mt-2" // Add some margin top
                    disabled={disabled} // Disable button if not in editing mode
                >
                    Clear Image
                </Button>
            )}
        </Form.Group>
    );
};

export default ImageUpload;