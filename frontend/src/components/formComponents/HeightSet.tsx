import React from "react"; // Importing React
import Form from "react-bootstrap/Form"; // Importing Form component from React-Bootstrap

/**
 * Defines the props for the HeightSet component.
 * @property {number} height - The current height value in centimeters.
 * @property {(height: number) => void} setHeight - Callback function to update the height in the parent component.
 * @property {boolean} isEditable - Boolean indicating whether the height slider is editable or just displayed.
 */
interface HeightSetProps {
    height: number;
    setHeight: (height: number) => void;
    isEditable: boolean;
}

/**
 * HeightSet component.
 * This component provides a range slider for selecting a height in centimeters.
 * It can function in both editable and display-only modes.
 */
const HeightSet: React.FC<HeightSetProps> = ({ height, setHeight, isEditable }) => {
    return (
        // Bootstrap Form.Group for proper form field layout and spacing.
        <Form.Group className="mb-3" controlId="formHeightRange">
            {/* Label for the height input, displaying the current selected height. */}
            <Form.Label>Height: {height} cm</Form.Label>
            {/* Form.Range component for the slider input. */}
            <Form.Range
                min={50} // Minimum selectable height (e.g., 50 cm)
                max={220} // Maximum selectable height (e.g., 220 cm)
                value={height} // Binds the slider's current value to the 'height' prop
                onChange={(e) => setHeight(Number(e.target.value))} // Updates parent's 'height' state when slider value changes
                disabled={!isEditable} // Disables the slider if 'isEditable' is false
            />
        </Form.Group>
    );
};

export default HeightSet; // Export the HeightSet component