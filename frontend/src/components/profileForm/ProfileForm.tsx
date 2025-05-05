import React from "react";
import { Form, Button } from "react-bootstrap";
import { User } from "../../types/User";

interface ProfileFormProps {
    profile: User;
    editing: boolean;
    onChange: (field: keyof User["profile"], value: any) => void;
    onSave: () => void;
}

const ProfileForm: React.FC<ProfileFormProps> = ({ profile, editing, onChange, onSave }) => {
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

            <Form.Group className="mb-3">
                <Form.Label>Gender</Form.Label>
                <Form.Control
                    type="text"
                    value={profile.profile.gender}
                    disabled={!editing}
                    onChange={(e) => onChange("gender", e.target.value)}
                />
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label>Height (cm)</Form.Label>
                <Form.Control
                    type="number"
                    value={profile.profile.height}
                    disabled={!editing}
                    onChange={(e) => onChange("height", Number(e.target.value))}
                />
            </Form.Group>

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

