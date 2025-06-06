import React from "react";
import Form from "react-bootstrap/Form";

interface DescriptionInputProps {
    description: string;
    setDescription: (description: string) => void;
}

const Description: React.FC<DescriptionInputProps> = ({ description, setDescription }) => {
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (e.target.value.length <= 300) {
            setDescription(e.target.value);
        }
    };

    return (
        <Form.Group className="mb-3" controlId="formDescription">
            <Form.Label>Description</Form.Label>
            <Form.Control
                as="textarea"
                rows={3}
                placeholder="Tell us something about yourself..."
                value={description}
                onChange={handleChange}
            />
            <Form.Text muted>
                {description.length}/300 characters
            </Form.Text>
        </Form.Group>
    );
};

export default Description;
