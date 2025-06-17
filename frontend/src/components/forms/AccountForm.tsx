import React, { FormEvent, useEffect } from "react";
import { Form, Button, Row, Col } from "react-bootstrap";

import { User } from "../../types/User";
import { Game } from "../../types/Game";
import GameSelector from "../formComponents/GameSelector";
import LocationSelector from "../formComponents/LocationSelector";
import RadiusSelector from "../formComponents/RadiusSelector";
import PreferredGenderSelector from "../formComponents/PreferredGenderSelector";
import Description from "../formComponents/Description";
import ImageUpload from "../formComponents/ImageUpload";
import HeightSet from "../formComponents/HeightSet";
import GenderSelector from "../formComponents/GenderSelector"; // Corrected typo if any, ensure this matches your actual file name
import useAccountForm from "../../hooks/useAccountForm"; // Import the new custom hook
import AgeRangeSelector from "../formComponents/AgeRangeSelector.tsx";

/**
 * Defines the props for the AccountForm component.
 * These are the external props passed to the component.
 */
interface AccountFormProps {
    profile: User;
    editing: boolean;
    onProfileChange: (field: keyof User["profile"], value: any) => void;
    onRootChange: (field: Exclude<keyof User, 'profile'>, value: any) => void;
    onSave: () => void;
    onImageChange: (file: File | null) => void;
    currentImageFile: File | null;
    onClearProfilePicture: () => void;
    onBirthDateValidationChange: (isValid: boolean) => void;
    onFormValidationChange: (isValid: boolean) => void;
    allAvailableGames: Game[];
}

/**
 * AccountForm component.
 * This component is responsible for rendering the user's account profile editing form.
 * It uses the `useAccountForm` hook to manage its internal state and validation logic.
 */
const AccountForm: React.FC<AccountFormProps> = ({
    profile,
    editing,
    onProfileChange,
    onRootChange,
    onSave,
    onImageChange,
    currentImageFile,
    onClearProfilePicture,
    onBirthDateValidationChange,
    onFormValidationChange,
    allAvailableGames,
}) => {
    // Use the custom hook to get all form-related states and handlers
    const {
        locationString,
        isNameValid,
        isBirthDateValidInternal,
        isLocationValid,
        handleLocationChange,
        handleBirthDateChange,
        handleNameChange,
        handleGamesChange,
        handleRadiusChange,
        handleGenderChange,
        handlePreferredGenderChange,
        handleDescriptionChange,
        handleHeightChange,
        handleAgeRangeChange,
        isSaveDisabled,
    } = useAccountForm({
        profile,
        editing,
        allAvailableGames,
        onProfileChange,
        onRootChange,
        onFormValidationChange,
        onBirthDateValidationChange,
    });
    const emailOrUsernameField = profile.email || profile.username;

    /**
     * Handles the overall form submission.
     * This simply calls the `onSave` prop passed from the parent.
     */
    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        onSave();
    };

    return (
        <Form onSubmit={handleSubmit}>

            <Form.Group className="mb-3" controlId="formEmailOrUsername">
                <Form.Label>Email / Username</Form.Label>
                <Form.Control
                    value={emailOrUsernameField}
                    disabled={true}
                />
                <Form.Text className="text-muted">
                    Cannot be changed.
                </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
                <ImageUpload
                    image={currentImageFile}
                    setImage={onImageChange}
                    disabled={!editing}
                    displayed={editing}
                    onClearImage={onClearProfilePicture}
                    currentProfilePicture={profile.profile.profilePicture}
                />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formName">
                <Form.Label>Name {editing && (<span style={{ color: "red" }}>*</span>)}</Form.Label>
                <Form.Control
                    type="text"
                    placeholder="Enter your name"
                    value={profile.profile.name}
                    onChange={handleNameChange} // Handler from hook
                    disabled={!editing}
                    isInvalid={!isNameValid} // Validation state from hook
                />
                <Form.Control.Feedback type="invalid">
                    Name is required.
                </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBirthDate">
                <Form.Label>Birth Date {editing && (<span style={{ color: "red" }}>*</span>)}</Form.Label>
                <Form.Control
                    type="date"
                    value={profile.profile.birthDate}
                    onChange={handleBirthDateChange} // Handler from hook
                    disabled={!editing}
                    isInvalid={!isBirthDateValidInternal} // Validation state from hook
                />
                <Form.Control.Feedback type="invalid">
                    Must be at least 18 years old and not a future date.
                </Form.Control.Feedback>
            </Form.Group>

            <GenderSelector
                selected={profile.profile.gender || ""}
                onChange={handleGenderChange} // Handler from hook
                isEditable={editing}
            />

            <PreferredGenderSelector
                selected={profile.interestedGenders || []}
                onChange={handlePreferredGenderChange} // Handler from hook
                isEditable={editing}
            />
            <AgeRangeSelector
                onChange={handleAgeRangeChange} // Handler from hook
                selectedRange={profile.interestedMinAge !== null && profile.interestedMaxAge !== null ?
                    [profile.interestedMinAge, profile.interestedMaxAge] : undefined}
                isEditable={editing}
            />

            <Form.Group className="mb-3">
                <HeightSet
                    height={profile.profile.height || 0}
                    setHeight={handleHeightChange} // Handler from hook
                    isEditable={editing}
                />
            </Form.Group>

            <Form.Group className="mb-3">
                <LocationSelector
                    value={locationString} // State from hook
                    onChange={handleLocationChange} // Handler from hook
                    isEditable={editing}
                    lat={profile.lat} // Passed from profile directly, as hook doesn't need to internalize it for render
                    lng={profile.lng} // Passed from profile directly
                    googlePlaceId={profile.googlePlaceId} // Passed from profile directly
                    isGpsUser={profile.isGpsUser} // Passed from profile directly
                    isInvalid={!isLocationValid} // Validation state from hook
                />
                <Form.Control.Feedback type="invalid">
                    If an address is provided, it must have valid coordinates.
                </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
                <RadiusSelector
                    radius={profile.radius || 0}
                    setRadius={handleRadiusChange} // Handler from hook
                    isEditable={editing}
                />
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label>Interested Games</Form.Label>
                <div className="mb-2">
                    <GameSelector
                        allGames={allAvailableGames}
                        selectedGameIds={new Set(profile.interestedGames?.map(g => g.id) || [])}
                        onToggle={handleGamesChange} // Handler from hook
                        disabled={!editing}
                    />
                </div>
            </Form.Group>

            <Form.Group className="mb-3">
                <Description
                    description={profile.profile.description || ""}
                    setDescription={handleDescriptionChange} // Handler from hook
                />
            </Form.Group>

            <Row className="mb-3">
                <Col>
                    <Button variant="primary" type="submit" disabled={isSaveDisabled}>
                        Save Changes
                    </Button>
                </Col>
            </Row>
        </Form>
    );
};

export default AccountForm;
