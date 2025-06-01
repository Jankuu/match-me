import React, { useState } from "react";
import { Form, Button } from "react-bootstrap";
import { User } from "../../types/User";
import HeightSet from "../registrationComponents/HeightSet";
import GenderSelector from "../registrationComponents/GenderSelection";
import NameInput from "../registrationComponents/NameInput";
import PreferredGenderSelector from "../registrationComponents/PreferredGenderSelector";
import LocationSelector from "../registrationComponents/LocationSelector";


interface ProfileFormProps {
  profile: User;
  editing: boolean;
  onProfileChange: (field: keyof User["profile"], value: any) => void;
  onRootChange: (field: keyof User, value: any) => void;
  onSave: () => void;
  onLocationDataChange?: (locationData: any) => void;
}

const ProfileForm: React.FC<ProfileFormProps> = ({
  profile,
  editing,
  onProfileChange,
  onRootChange,
  onSave, onLocationDataChange
}) => {
  const [isNameValid, setIsNameValid] = useState(true);

  const handleSaveInternal = () => {
    if (!isNameValid) return;
    onSave();
  };

  return (
    <Form>
      {/* Username (read-only) */}
      <Form.Group className="mb-3">
        <Form.Label>Username</Form.Label>
        <Form.Control type="text" value={profile.username} disabled />
      </Form.Group>

      {/* Email (read-only) */}
      <Form.Group className="mb-3">
        <Form.Label>Email</Form.Label>
        <Form.Control type="email" value={profile.email} disabled />
      </Form.Group>

      {/* Birth Date (read-only) */}
      <Form.Group className="mb-3">
        <Form.Label>Birth Date</Form.Label>
        <Form.Control type="date" value={profile.profile.birthDate} disabled />
      </Form.Group>

      {/* Name */}
      <NameInput
        value={profile.profile.name}
        onChange={(value) => onProfileChange("name", value)}
        onValidate={setIsNameValid}
        disabled={!editing}
      />

      {/* Gender */}
      <GenderSelector
        selected={profile.profile.gender}
        onChange={(value) => onProfileChange("gender", value)}
        isEditable={editing}
      />

      {/* Height */}
      <HeightSet
        height={profile.profile.height}
        setHeight={(value) => onProfileChange("height", value)}
        isEditable={editing}
      />

      {/* Preferred Gender */}
      <PreferredGenderSelector
        selected={profile.interestedGenders}
        onChange={(genders) => onRootChange("interestedGenders", genders)} isEditable={false}        // isEditable={editing}
        // disabled={!editing}
      />

        <LocationSelector
            value={profile.profile.location || ""}
            onChange={(value, placeId, coordinates, isGpsUsed) => {
                onProfileChange("location", value);
                if (placeId && coordinates) {
                    const newLocationData = {
                        placeId,
                        coordinates,
                        isGpsUsed: isGpsUsed || false
                    };
                    onLocationDataChange(newLocationData);
                } else if (value === '') {
                    onLocationDataChange(undefined);
                }
            }}
            isEditable={editing}
            locationData={profile.locationData}
        />
      {/* Description */}
      <Form.Group className="mb-3">
        <Form.Label>Description</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          value={profile.profile.description || ""}
          disabled={!editing}
          onChange={(e) => onProfileChange("description", e.target.value)}
        />
      </Form.Group>

            {editing && (
                <Button variant="success" onClick={onSave}>
                    Save Changes
                </Button>
            )}
        </Form>
    );
};

export default ProfileForm;

