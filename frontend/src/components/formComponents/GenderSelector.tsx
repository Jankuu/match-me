import { Button } from "react-bootstrap"; // Importing Button component from React-Bootstrap
import { GenderMale, GenderFemale, People } from "react-bootstrap-icons"; // Importing gender icons from react-bootstrap-icons

/**
 * Defines the props for the GenderSelector component.
 * @property {string} selected - The currently selected gender ('man', 'woman', or 'any'/'other').
 * @property {(gender: string) => void} onChange - Callback function to update the selected gender in the parent component.
 * @property {boolean} isEditable - Boolean indicating whether the gender selection is editable or just displayed.
 */
type Props = {
  selected: string;
  onChange: (gender: string) => void;
  isEditable: boolean;
};

/**
 * GenderSelector component.
 * This component allows users to select their gender from predefined options.
 * It has two modes: editable (buttons) and display-only (disabled button).
 */
const GenderSelector = ({ selected, onChange, isEditable }: Props) => {
  /**
   * Helper function to render the common label for the gender selection.
   * @returns React.JSX.Element The label element.
   */
  const renderLabel = () => (
    <label className="form-label">
      Gender{isEditable && (<span style={{ color: "red" }}>*</span>)}
      {/* Optional: Add a red asterisk here if gender is a required field and isEditable. */}
      {/* {isEditable && <span style={{ color: "red" }}>*</span>} */}
    </label>
  );

  // If the component is NOT editable, display the selected gender as a disabled button.
  if (!isEditable) {
    // Determine the display label based on the 'selected' gender value.
    const label = selected === "man" ? "Male" : selected === "woman" ? "Female" : "Other";
    // Determine which icon to display based on the 'selected' gender value.
    const Icon =
      selected === "man"
        ? GenderMale // Male icon for "man"
        : selected === "woman"
        ? GenderFemale // Female icon for "woman"
        : People; // Generic "People" icon for "other" or unspecified

    return (
      <div className="mb-4">
        {renderLabel()} {/* Render the common label */}
        <div className="mt-2">
          {/* Display the selected gender using a disabled Bootstrap Button */}
          <Button variant="secondary" disabled className="d-flex align-items-center gap-2">
            <Icon size={20} /> {label} {/* Display the corresponding icon and label */}
          </Button>
        </div>
      </div>
    );
  }

  // If the component IS editable, display interactive buttons for gender selection.
  return (
    <div className="mb-4">
      {renderLabel()} {/* Render the common label */}
      <div className="d-flex gap-3 mt-2">
        {/* Button for "Male" */}
        <Button
          // 'variant' changes based on whether "man" is currently selected (primary) or not (outline-primary).
          variant={selected === "man" ? "primary" : "outline-primary"}
          onClick={() => onChange("man")} // Calls parent's onChange with "man" when clicked
          className="d-flex align-items-center gap-2" // Styles for icon and text alignment
        >
          <GenderMale size={20} /> Male
        </Button>

        {/* Button for "Female" */}
        <Button
          // 'variant' changes based on whether "woman" is currently selected (danger) or not (outline-danger).
          variant={selected === "woman" ? "danger" : "outline-danger"}
          onClick={() => onChange("woman")} // Calls parent's onChange with "woman" when clicked
          className="d-flex align-items-center gap-2" // Styles for icon and text alignment
        >
          <GenderFemale size={20} /> Female
        </Button>

        {/* Optional "Other" button (currently commented out but provided as an example)
        <Button
          variant={selected === "any" ? "success" : "outline-success"}
          onClick={() => onChange("any")}
          className="d-flex align-items-center gap-2"
        >
          <People size={20} /> Other
        </Button>
        */}
      </div>
    </div>
  );
};

export default GenderSelector; // Export the GenderSelector component