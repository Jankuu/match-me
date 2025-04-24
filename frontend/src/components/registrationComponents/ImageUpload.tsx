import { Form } from "react-bootstrap";

type Props = {
    image: File | null;
    setImage: (file: File | null) => void;
    loading: boolean;
};

const ImageUpload = ({ image, setImage, loading }: Props) => {
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setImage(e.target.files[0]);
        }
    };

    return (
        <Form.Group className="mb-3">
            <Form.Label>Profile Image</Form.Label>
            <Form.Control
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                disabled={loading}
            />
            {image && <p>Selected file: {image.name}</p>}
        </Form.Group>
    );
};

export default ImageUpload;
