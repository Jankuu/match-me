import { Button } from "react-bootstrap";
import { GenderMale, GenderFemale, People } from "react-bootstrap-icons";

type Props = {
  selected: string;
  onChange: (gender: string) => void;
};

const GenderSelector = ({ selected, onChange }: Props) => {
  return (
    <div className="mb-4">
      <label className="form-label">
        Preferred partner gender <span style={{ color: "red" }}>*</span>
      </label>
      <div className="d-flex gap-3 mt-2">
        <Button
          variant={selected === "male" ? "primary" : "outline-primary"}
          onClick={() => onChange("male")}
          className="d-flex align-items-center gap-2"
        >
          <GenderMale size={20} /> Male
        </Button>
        <Button
          variant={selected === "female" ? "danger" : "outline-danger"}
          onClick={() => onChange("female")}
          className="d-flex align-items-center gap-2"
        >
          <GenderFemale size={20} /> Female
        </Button>
        <Button
          variant={selected === "any" ? "success" : "outline-success"}
          onClick={() => onChange("any")}
          className="d-flex align-items-center gap-2"
        >
          <People size={20} /> Any
        </Button>
      </div>
    </div>
  );
};

export default GenderSelector;
