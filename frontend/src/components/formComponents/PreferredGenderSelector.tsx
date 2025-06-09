import { Button } from "react-bootstrap"; // Importing Button component from React-Bootstrap
import { GenderMale, GenderFemale, People } from "react-bootstrap-icons"; // Importing gender-related icons
import React from "react"; // Explicitly import React for FC type

/**
 * Defines the props for the PreferredGenderSelector component.
 *
 * @property {string[]} selected - An array of strings representing the currently selected preferred genders.
 * Can be `["man"]`, `["woman"]`, `["man", "woman"]` for "Any", or `[]` for "Not specified".
 * @property {(gender: string[]) => void} onChange - Callback function to update the selected preferred genders in the parent component.
 * @property {boolean} isEditable - Boolean indicating whether the gender selection is interactive or just displayed.
 */
type Props = {
    selected: string[];
    onChange: (gender: string[]) => void;
    isEditable: boolean;
};

/**
 * PreferredGenderSelector component.
 * This component allows users to select their preferred partner gender(s) from "Male", "Female", or "Any".
 * It can operate in both editable and display-only modes.
 */
const PreferredGenderSelector: React.FC<Props> = ({ selected, onChange, isEditable }) => {
    /**
     * Helper function to render the common label for the gender selection.
     * Includes a red asterisk if the component is editable, indicating a required field.
     * @returns React.JSX.Element The label element.
     */
    const renderLabel = () => (
        <label className="form-label">
            Preferred partner gender {isEditable && <span style={{ color: "red" }}>*</span>}
        </label>
    );

    /**
     * Determines the display label for the selected preferred gender(s) when in display-only mode.
     * - "Any" if both "man" and "woman" are selected.
     * - "Male" if only "man" is selected.
     * - "Female" if only "woman" is selected.
     * - "Not specified" for any other case (e.g., empty array or unexpected values).
     */
    const label =
        selected.length === 2
            ? "Any"
            : selected.includes("man") && selected.length === 1
            ? "Male"
            : selected.includes("woman") && selected.length === 1
            ? "Female"
            : "Not specified";

    /**
     * Determines the appropriate icon to display based on the selected preferred gender(s).
     * - `People` icon for "Any" or "Not specified".
     * - `GenderMale` icon for "Male".
     * - `GenderFemale` icon for "Female".
     */
    const Icon =
        selected.length === 2
            ? People
            : selected.includes("man") && selected.length === 1
            ? GenderMale
            : selected.includes("woman") && selected.length === 1
            ? GenderFemale
            : People;

    // --- Display Mode (isEditable is false) ---
    // If the component is NOT editable, it displays the selected preferred gender(s) as a disabled button.
    if (!isEditable) {
        return (
            <div className="mb-4">
                {renderLabel()} {/* Render the common label */}
                <div className="mt-2">
                    {/* Display the selected preferred gender using a disabled Bootstrap Button */}
                    <Button variant="secondary" disabled className="d-flex align-items-center gap-2">
                        <Icon size={20} /> {label} {/* Display the corresponding icon and determined label */}
                    </Button>
                </div>
            </div>
        );
    }

    // --- Editable Mode (isEditable is true) ---
    // If the component IS editable, it displays interactive buttons for preferred gender selection.
    return (
        <div className="mb-4">
            {renderLabel()} {/* Render the common label */}
            <div className="d-flex gap-3 mt-2">
                {/* Button for "Male" preference */}
                <Button
                    // Variant changes to 'primary' if only "man" is selected, otherwise 'outline-primary'.
                    variant={selected.includes("man") && selected.length === 1 ? "primary" : "outline-primary"}
                    onClick={() => onChange(["man"])} // Sets preference to only "man"
                    className="d-flex align-items-center gap-2" // Styles for icon and text alignment
                >
                    <GenderMale size={20} /> Male
                </Button>

                {/* Button for "Female" preference */}
                <Button
                    // Variant changes to 'danger' if only "woman" is selected, otherwise 'outline-danger'.
                    variant={selected.includes("woman") && selected.length === 1 ? "danger" : "outline-danger"}
                    onClick={() => onChange(["woman"])} // Sets preference to only "woman"
                    className="d-flex align-items-center gap-2" // Styles for icon and text alignment
                >
                    <GenderFemale size={20} /> Female
                </Button>

                {/* Button for "Any" gender preference (both male and female) */}
                <Button
                    // Variant changes to 'success' if both "man" and "woman" are selected, otherwise 'outline-success'.
                    variant={selected.includes("man") && selected.includes("woman") ? "success" : "outline-success"}
                    onClick={() => onChange(["man", "woman"])} // Sets preference to both "man" and "woman"
                    className="d-flex align-items-center gap-2" // Styles for icon and text alignment
                >
                    <People size={20} /> Any
                </Button>
            </div>
        </div>
    );
};

export default PreferredGenderSelector; // Export the component