import React from "react";
import Form from "react-bootstrap/Form";

interface HeightSetProps {
    height: number;
    setHeight: (height: number) => void;
}

const HeightSet: React.FC<HeightSetProps> = ({ height, setHeight }) => {
    return (
        <Form.Group className="mb-3" controlId="formHeightRange">
            <Form.Label>Height: {height} cm</Form.Label>
            <Form.Range
                min={50}
                max={220}
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
            />
        </Form.Group>
    );
};

export default HeightSet;
