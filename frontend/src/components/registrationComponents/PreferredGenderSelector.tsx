import { Button } from "react-bootstrap";
import { GenderMale, GenderFemale, People } from "react-bootstrap-icons";

type Props = {
  selected: string[];
  onChange: (gender: string[]) => void;
};

const PreferredGenderSelector = ({ selected, onChange }: Props) => {
  return (
    <div className="mb-4">
      <label className="form-label">
        Preferred partner gender <span style={{ color: "red" }}>*</span>
      </label>
      <div className="d-flex gap-3 mt-2">
        <Button
          variant={selected[0] === "male" && selected.length === 1 ? "primary" : "outline-primary"}
          onClick={() => onChange(["man"])}
          className="d-flex align-items-center gap-2"
        >
          <GenderMale size={20} /> Male
        </Button>
        <Button
          variant={selected[0] === "female" && selected.length === 1 ? "danger" : "outline-danger"}
          onClick={() => onChange(["woman"])}
          className="d-flex align-items-center gap-2"
        >
          <GenderFemale size={20} /> Female
        </Button>
        <Button
          variant={selected[0] === "man" && selected[1] === "woman" ? "success" : "outline-success"}
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
