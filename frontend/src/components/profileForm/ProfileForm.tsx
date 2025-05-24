import React, { useState } from "react";
import { Form, Button } from "react-bootstrap";
import { User } from "../../types/User";
import HeightSet from "../registrationComponents/HeightSet";
import GenderSelector from "../registrationComponents/GenderSelection";
import NameInput from "../registrationComponents/NameInput";

interface ProfileFormProps {
  profile: User;
  editing: boolean;
  onChange: (field: keyof User["profile"], value: any) => void;
  onSave: () => void;
}

const ProfileForm: React.FC<ProfileFormProps> = ({
  profile,
  editing,
  onChange,
  onSave,
}) => {
  const [isNameValid, setIsNameValid] = useState(true);

  const handleSaveInternal = () => {
    if (!isNameValid) return;
    onSave();
  };

  return (
    <Form>
      <Form.Group className="mb-3">
        <Form.Label>Username</Form.Label>
        <Form.Control type="text" value={profile.username} disabled />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Email</Form.Label>
        <Form.Control type="email" value={profile.email} disabled />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Birth Date</Form.Label>
        <Form.Control type="date" value={profile.profile.birthDate} disabled />
      </Form.Group>

      <NameInput
        value={profile.profile.name}
        onChange={(value) => onChange("name", value)}
        onValidate={setIsNameValid}
        disabled={!editing}
      />

      <GenderSelector
        selected={profile.profile.gender}
        onChange={(value) => onChange("gender", value)}
        isEditable={editing}
      />

      <HeightSet
        height={profile.profile.height}
        setHeight={(value) => onChange("height", value)}
        isEditable={editing}
      />

      <Form.Group className="mb-3">
        <Form.Label>Description</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          value={profile.profile.description || ""}
          disabled={!editing}
          onChange={(e) => onChange("description", e.target.value)}
        />
      </Form.Group>

      {editing && (
        <Button variant="success" onClick={handleSaveInternal} disabled={!isNameValid}>
          Save Changes
        </Button>
      )}
    </Form>
  );
};

export default ProfileForm;
