import { Button } from "react-bootstrap";
import { GenderMale, GenderFemale, People } from "react-bootstrap-icons";

type Props = {
  selected: string;
  onChange: (gender: string) => void;
  isEditable: boolean;
};

const GenderSelector = ({ selected, onChange, isEditable }: Props) => {
  const renderLabel = () => (
    <label className="form-label">
      Gender 
      {/* {isEditable && <span style={{ color: "red" }}>*</span>} */}
    </label>
  );

  if (!isEditable) {
    const label = selected === "man" ? "Male" : selected === "woman" ? "Female" : "Other";
    const Icon =
      selected === "man"
        ? GenderMale
        : selected === "woman"
        ? GenderFemale
        : People;

    return (
      <div className="mb-4">
        {renderLabel()}
        <div className="mt-2">
          <Button variant="secondary" disabled className="d-flex align-items-center gap-2">
            <Icon size={20} /> {label}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-4">
      {renderLabel()}
      <div className="d-flex gap-3 mt-2">
        <Button
          variant={selected === "man" ? "primary" : "outline-primary"}
          onClick={() => onChange("man")}
          className="d-flex align-items-center gap-2"
        >
          <GenderMale size={20} /> Male
        </Button>
        <Button
          variant={selected === "woman" ? "danger" : "outline-danger"}
          onClick={() => onChange("woman")}
          className="d-flex align-items-center gap-2"
        >
          <GenderFemale size={20} /> Female
        </Button>
        {/* Optional "Other" button
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

export default GenderSelector;
