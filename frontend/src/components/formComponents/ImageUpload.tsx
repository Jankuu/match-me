import { Form } from "react-bootstrap";
import React from "react"; // Explicitly import React for FC type if not already

type Props = {
    image: File | null;
    setImage: (file: File | null) => void;
    displayed: boolean;
};

const ImageUpload = ({ image, setImage, displayed }: Props) => {
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setImage(e.target.files[0]);
        } else {
            setImage(null); // Clear image if nothing is selected or file input is cleared
        }
    };

    // Conditional rendering: if displayed is false, return null (render nothing)
    if (!displayed) {
        return null;
    }

    return (
        <Form.Group className="mb-3">
            <Form.Label>Profile Image</Form.Label>
            <Form.Control
                type="file"
                accept="image/*"
                onChange={handleImageChange}
            />
            {image && <p>Selected file: {image.name}</p>}
            {/* we also can to display the current profile.profilePicture here
                when not in editing mode, or a placeholder if no image is selected.
                However, ProfilePicture component already handles displaying.
                If you want a preview of the *newly selected* image before save,
                you'd need to add local state and FileReader here too, or display
                `user.profile.profilePicture` from `MyProfilePage` directly here.
            */}
        </Form.Group>
    );
};

export default ImageUpload;