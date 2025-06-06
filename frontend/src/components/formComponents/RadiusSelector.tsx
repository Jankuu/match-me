import React from "react";
import Form from "react-bootstrap/Form";

interface RadiusSelectorProps {
    radius: number;
    setRadius: (radius: number) => void;
    isEditable: boolean;
}

const RadiusSelector: React.FC<RadiusSelectorProps> = ({ radius, setRadius, isEditable }) => {
    return (
        <Form.Group className="mb-3" controlId="formHeightRange">
            <Form.Label>Matching radius: {radius} m</Form.Label>
            <Form.Range
                min={1500}
                max={300000}
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                disabled={!isEditable}
            />
        </Form.Group>
    );
};

export default RadiusSelector;
