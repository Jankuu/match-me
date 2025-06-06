import React from "react";
import Form from "react-bootstrap/Form";

interface HeightSetProps {
    height: number;
    setHeight: (height: number) => void;
    isEditable: boolean;
}

const HeightSet: React.FC<HeightSetProps> = ({ height, setHeight, isEditable }) => {
    return (
        <Form.Group className="mb-3" controlId="formHeightRange">
            <Form.Label>Height: {height} cm</Form.Label>
            <Form.Range
                min={50}
                max={220}
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
                disabled={!isEditable}
            />
        </Form.Group>
    );
};

export default HeightSet;
