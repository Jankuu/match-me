import React, { useState, useEffect, useCallback } from "react";
import { Form, Button, Row, Col } from "react-bootstrap";

import { User } from "../../types/User";
import { Game } from "../../dto/Game";
import GameSelector from "../formComponents/GameSelector";
import LocationSelector from "../formComponents/LocationSelector";
import RadiusSelector from "../formComponents/RadiusSelector";
import PreferredGenderSelector from "../formComponents/PreferredGenderSelector";
import Description from "../formComponents/Description";
import ImageUpload from "../formComponents/ImageUpload";

import HeightSet from "../formComponents/HeightSet";
import { Coordinates } from "../../types/Cordinates";
import GenderSelector from "../formComponents/GernderSelector";

/**
 * Defines the props for the AccountForm component.
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
    onFormValidationChange: (isValid: boolean) => void; // This is crucial for isSaveDisabled
    allAvailableGames: Game[];
}

/**
 * AccountForm component.
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
    // --- Internal States for Form Field Validation & Specifics ---
    const [locationString, setLocationString] = useState<string>(profile.cityName || "");
    const [locationCoordinates, setLocationCoordinates] = useState<Coordinates | undefined>(
        profile.lat !== null && profile.lng !== null ? { lat: profile.lat, lng: profile.lng } : undefined
    );
    const [locationPlaceId, setLocationPlaceId] = useState<string | undefined>(profile.googlePlaceId || undefined);
    const [isLocationGpsUsedInternal, setIsLocationGpsUsedInternal] = useState<boolean | undefined>(profile.isGpsUsed === true);

    // Validation states for required fields
    const [isNameValid, setIsNameValid] = useState(profile.profile.name.trim().length > 0);
    const [isBirthDateValidInternal, setIsBirthDateValidInternal] = useState(true);
    const [isLocationValid, setIsLocationValid] = useState(true); // State for location validity
    const [isFormValid, setIsFormValid] = useState(false); // Local state to track overall form validity

    /**
     * useEffect to synchronize internal location states with `profile` (UserDTO) changes from parent.
     */
    useEffect(() => {
        setLocationString(profile.cityName || "");
        setLocationCoordinates(profile.lat !== null && profile.lng !== null ? { lat: profile.lat, lng: profile.lng } : undefined);
        setLocationPlaceId(profile.googlePlaceId || undefined);
        setIsLocationGpsUsedInternal(profile.isGpsUsed === true);

        const isLocOk = !(profile.cityName && (profile.lat === null || profile.lng === null));
        setIsLocationValid(isLocOk);
    }, [profile.cityName, profile.lat, profile.lng, profile.googlePlaceId, profile.isGpsUsed]);

    /**
     * useEffect to notify the parent about the overall form validation status.
     */
    useEffect(() => {
        const overallValid =
            isNameValid &&
            isBirthDateValidInternal &&
            isLocationValid &&
            !!profile.profile.gender && // Ensure gender is selected
            !!profile.interestedGenders?.length &&
            (profile.profile.height !== null && profile.profile.height !== 0) &&
            (profile.radius !== null && profile.radius !== 0);

        setIsFormValid(overallValid); // Update local state
        onFormValidationChange(overallValid); // Notify parent
    }, [
        isNameValid,
        isBirthDateValidInternal,
        isLocationValid,
        profile.profile.gender,
        profile.interestedGenders,
        profile.profile.height,
        profile.radius,
        onFormValidationChange,
    ]);

    /**
     * Callback for handling location changes from `LocationSelector`.
     */
    const handleLocationChange = useCallback(
        (
            address: string,
            placeId: string | null,
            coordinates: Coordinates | null,
            isGpsUsed: boolean | null
        ) => {
            setLocationString(address);
            setLocationPlaceId(placeId === null ? undefined : placeId);
            setLocationCoordinates(coordinates === null ? undefined : coordinates);
            setIsLocationGpsUsedInternal(isGpsUsed === true);

            onRootChange("cityName", address);
            onRootChange("googlePlaceId", placeId);
            onRootChange("lat", coordinates ? coordinates.lat : null);
            onRootChange("lng", coordinates ? coordinates.lng : null);
            onRootChange("isGpsUsed", isGpsUsed === true);

            const isValid = !(address.length > 0 && (!coordinates || coordinates.lat === null || coordinates.lng === null));
            setIsLocationValid(isValid);
        },
        [onRootChange]
    );

    /**
     * Callback for handling birth date changes.
     */
    const handleBirthDateChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const newDate = e.target.value;
            onProfileChange("birthDate", newDate);

            const birthDate = new Date(newDate);
            const today = new Date();
            const minDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());

            const isValid = birthDate <= today && birthDate <= minDate;
            setIsBirthDateValidInternal(isValid);
            onBirthDateValidationChange(isValid);
        },
        [onProfileChange, onBirthDateValidationChange]
    );

    /**
     * Callback for handling user name changes.
     */
    const handleNameChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const newName = e.target.value;
            onProfileChange("name", newName);
            setIsNameValid(newName.trim().length > 0);
        },
        [onProfileChange]
    );

    /**
     * Callback for handling changes in game selection from GameSelector.
     */
    const handleGamesChange = useCallback(
        (newSelectedGameIds: Set<number>) => {
            const updatedGames = Array.from(newSelectedGameIds).map(id => {
                const game = allAvailableGames.find(g => g.id === id);
                return game || { id: id, name: `Unknown Game ${id}` };
            });
            onRootChange("interestedGames", updatedGames);
        },
        [onRootChange, allAvailableGames]
    );

    /**
     * Callback for handling radius changes.
     */
    const handleRadiusChange = useCallback(
        (newRadius: number) => {
            onRootChange("radius", newRadius);
        },
        [onRootChange]
    );

    /**
     * Callback for handling gender changes.
     */
    const handleGenderChange = useCallback(
        (gender: string) => {
            onProfileChange("gender", gender);
        },
        [onProfileChange]
    );

    /**
     * Callback for handling preferred gender changes.
     */
    const handlePreferredGenderChange = useCallback(
        (genders: string[]) => {
            onRootChange("interestedGenders", genders);
        },
        [onRootChange]
    );

    /**
     * Callback for handling description changes.
     */
    const handleDescriptionChange = useCallback(
        (description: string) => {
            onProfileChange("description", description);
        },
        [onProfileChange]
    );

    /**
     * Callback for handling height changes.
     */
    const handleHeightChange = useCallback(
        (height: number) => {
            onProfileChange("height", height);
        },
        [onProfileChange]
    );

    /**
     * Handles form submission.
     */
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave();
    };

    const isSaveDisabled = !editing || !isFormValid || profile.id === null;

    return (
        <Form onSubmit={handleSubmit}>
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
                    onChange={handleNameChange}
                    disabled={!editing}
                    isInvalid={!isNameValid}
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
                    onChange={handleBirthDateChange}
                    disabled={!editing}
                    isInvalid={!isBirthDateValidInternal}
                />
                <Form.Control.Feedback type="invalid">
                    Must be at least 18 years old and not a future date.
                </Form.Control.Feedback>
            </Form.Group>

            <GenderSelector
                selected={profile.profile.gender || ""} // Pass the current gender from profile
                onChange={handleGenderChange} // Use the dedicated handler
                isEditable={editing} // Make it editable only when in editing mode
            />

            <PreferredGenderSelector
                selected={profile.interestedGenders || []}
                onChange={handlePreferredGenderChange}
                isEditable={editing}
            />

            <Form.Group className="mb-3">
                <HeightSet
                    height={profile.profile.height || 0}
                    setHeight={handleHeightChange}
                    isEditable={editing}
                />
            </Form.Group>

            <Form.Group className="mb-3">
                <LocationSelector
                    value={locationString}
                    onChange={handleLocationChange}
                    isEditable={editing}
                    lat={profile.lat}
                    lng={profile.lng}
                    googlePlaceId={profile.googlePlaceId}
                    isGpsUsed={profile.isGpsUsed}
                    isInvalid={!isLocationValid}
                />
                <Form.Control.Feedback type="invalid">
                    If an address is provided, it must have valid coordinates.
                </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
                <RadiusSelector
                    radius={profile.radius || 0}
                    setRadius={handleRadiusChange}
                    isEditable={editing}
                />
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label>Interested Games</Form.Label>
                <div className="mb-2">
                    <GameSelector
                        allGames={allAvailableGames}
                        selectedGameIds={new Set(profile.interestedGames?.map(g => g.id) || [])}
                        onToggle={handleGamesChange}
                        disabled={!editing}
                    />
                </div>
            </Form.Group>

            <Form.Group className="mb-3">
                <Description
                    description={profile.profile.description || ""}
                    setDescription={handleDescriptionChange}
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