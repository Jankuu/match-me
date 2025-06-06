import { Button } from "react-bootstrap";
import { GenderMale, GenderFemale, People } from "react-bootstrap-icons";

type Props = {
  selected: string[];
  onChange: (gender: string[]) => void;
  isEditable: boolean;
};

const PreferredGenderSelector = ({ selected, onChange, isEditable }: Props) => {
  const renderLabel = () => (
    <label className="form-label">
      Preferred partner gender {isEditable && <span style={{ color: "red" }}>*</span>}
    </label>
  );

  const label =
    selected.length === 2
      ? "Any"
      : selected[0] === "man"
      ? "Male"
      : selected[0] === "woman"
      ? "Female"
      : "Not specified";

  const Icon =
    selected.length === 2
      ? People
      : selected[0] === "man"
      ? GenderMale
      : selected[0] === "woman"
      ? GenderFemale
      : People;

  if (!isEditable) {
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
          variant={selected.length === 1 && selected[0] === "man" ? "primary" : "outline-primary"}
          onClick={() => onChange(["man"])}
          className="d-flex align-items-center gap-2"
        >
          <GenderMale size={20} /> Male
        </Button>
        <Button
          variant={selected.length === 1 && selected[0] === "woman" ? "danger" : "outline-danger"}
          onClick={() => onChange(["woman"])}
          className="d-flex align-items-center gap-2"
        >
          <GenderFemale size={20} /> Female
        </Button>
        <Button
          variant={selected.includes("man") && selected.includes("woman") ? "success" : "outline-success"}
          onClick={() => onChange(["man", "woman"])}
          className="d-flex align-items-center gap-2"
        >
          <People size={20} /> Any
        </Button>
      </div>
    </div>
  );
};

export default PreferredGenderSelector;
