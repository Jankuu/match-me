import React from "react"; // Importing React for building the component
import Form from "react-bootstrap/Form"; // Importing the Form component from React-Bootstrap

/**
 * Defines the props for the RadiusSelector component.
 *
 * @property {number} radius - The current value of the matching radius in meters.
 * @property {(radius: number) => void} setRadius - A callback function to update the radius value in the parent component.
 * @property {boolean} isEditable - A flag indicating whether the radius selector is interactive or just for display.
 */
interface RadiusSelectorProps {
    radius: number;
    setRadius: (radius: number) => void;
    isEditable: boolean;
}

/**
 * The RadiusSelector component provides a range slider for users to select a desired matching radius in meters.
 * It features a label displaying the current radius and can be toggled between editable and disabled states.
 */
const RadiusSelector: React.FC<RadiusSelectorProps> = ({ radius, setRadius, isEditable }) => {
    return (
        // A Bootstrap Form.Group is used for proper layout and spacing of form elements.
        <Form.Group className="mb-3" controlId="formRadiusRange">
            {/* The Form.Label displays the current radius value, providing immediate feedback to the user. */}
            <Form.Label>Matching radius: {radius} m</Form.Label>

            {/* The Form.Range component renders an HTML range input (slider). */}
            <Form.Range
                min={1500} // The minimum selectable radius, set to 1500 meters (1.5 km).
                max={300000} // The maximum selectable radius, set to 300000 meters (300 km).
                value={radius} // Binds the slider's position to the 'radius' prop, making it a controlled component.
                onChange={(e) => setRadius(Number(e.target.value))} // Updates the 'radius' in the parent component whenever the slider is moved.
                disabled={!isEditable} // Disables the slider if the 'isEditable' prop is false, making it display-only.
            />
        </Form.Group>
    );
};

export default RadiusSelector; // Exports the RadiusSelector component for use in other parts of the application.