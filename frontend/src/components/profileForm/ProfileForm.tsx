import React, { useState } from "react";
import { Form, Button } from "react-bootstrap";
import { User } from "../../types/User";
import HeightSet from "../registrationComponents/HeightSet";
import GenderSelector from "../registrationComponents/GenderSelection";

interface ProfileFormProps {
    profile: User;
    editing: boolean;
    onChange: (field: keyof User["profile"], value: any) => void;
    onSave: () => void;

}

const ProfileForm: React.FC<ProfileFormProps> = ({ profile, editing, onChange, onSave }) => {

    const [height, setHeight] = useState<number>(profile.profile.height);
    const [gender, setGender] = useState<string>(profile.profile.gender);
    
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

                <GenderSelector onChange={setGender} selected={gender} isEditable={editing} />
                <HeightSet height={height} setHeight={setHeight} isEditable={editing}/>

            <Form.Group className="mb-3">
                <Form.Label>Location</Form.Label>
                <Form.Control
                    type="text"
                    value={profile.profile.location || ""}
                    disabled={!editing}
                    onChange={(e) => onChange("location", e.target.value)}
                />
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                    as="textarea"
                    rows={3}
                    value={profile.profile.description}
                    disabled={!editing}
                    onChange={(e) => onChange("description", e.target.value)}
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

