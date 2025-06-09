import React, { FormEvent } from "react";
import { Button, Form, Spinner } from "react-bootstrap";

import NameInput from "../formComponents/NameInput";
import EmailInput from "../formComponents/EmailInput";
import PasswordInput from "../formComponents/PasswordInput";
import AgeRangeSelector from "../formComponents/AgeRangeSelector";
import PreferredGenderSelector from "../formComponents/PreferredGenderSelector";
import ImageUpload from "../formComponents/ImageUpload";
import LocationSelector from "../formComponents/LocationSelector";
import HeightSet from "../formComponents/HeightSet";
import Description from "../formComponents/Description";
import UsernameInput from "../formComponents/UsernameInput";
import BirthDateSelector from "../formComponents/BirthdateSelector";
import GameSelector from "../formComponents/GameSelector";
import RadiusSelector from "../formComponents/RadiusSelector";
import GenderSelector from "../formComponents/GenderSelector";

import { UserRegistration } from "../../types/UserRegistration"; // Ensure this path is correct
import useRegistrationForm from "../../hooks/useRegistrationForm"; // Import the new custom hook

import "../../styles/GameSelector.css"; // Keep any necessary styles

/**
 * Props for the RegisterForm component.
 * @param onSubmit A callback function that takes UserRegistrationDTO and is called when the form is submitted.
 * @param loading A boolean indicating if the submission process is ongoing, used to disable the form.
 */
type Props = {
    onSubmit: (data: UserRegistration) => void;
    loading: boolean;
};

/**
 * RegisterForm component.
 * This component renders the entire user registration form. It delegates all
 * form state management, validation, and data preparation to the `useRegistrationForm` hook,
 * focusing purely on the UI presentation.
 */
const RegisterForm = ({ onSubmit, loading }: Props) => {
    // Use the custom hook to get all form-related states, setters, and handlers
    const {
        // Account Details
        username, setUsername,
        email, setEmail,
        repeatedEmail, setRepeatedEmail,
        password, setPassword,
        repeatedPassword, setRepeatedPassword,

        // Profile Details
        name, setName,
        image, setImage,
        birthDateUi, setBirthDateUi,
        gender, setGender,
        height, setHeight,
        description, setDescription,

        // Preferences
        preferedAgerange, setpreferedAgeRange,
        preferredGenders, setPreferredGenders,

        // Location
        locationCityName,
        googlePlaceId,
        locationCoordinates,
        isGpsUsed,
        radius, setRadius,
        handleLocationChange, // Handler for location

        // Games
        games,
        selectedGameIdsForSelector,
        handleGamesChange,

        // Validation States & Derived Values
        usernameValid, setUsernameValid,
        nameValid, setNameValid,
        isBirthDateValid, setIsBirthDateValid,
        isLocationValid,
        isPasswordValid, passwordMatch,
        isEmailValid, emailMatch,
        isFormValid, // Overall form validity

        // Submission handler from the hook
        prepareAndSubmit,
    } = useRegistrationForm();

    /**
     * Handles the form submission event.
     * Calls the `prepareAndSubmit` function from the hook, passing the parent's `onSubmit` callback.
     */
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        await prepareAndSubmit(onSubmit);
    };

    return (
        <Form onSubmit={handleSubmit}>
            {/* Account Details */}
            <EmailInput
                email={email}
                repeatedEmail={repeatedEmail}
                setEmail={setEmail}
                setRepeatedEmail={setRepeatedEmail}
                loading={loading}
                // isInvalid={!isEmailValid || !emailMatch} // Pass validation status
            />
            <PasswordInput
                password={password}
                repeatedPassword={repeatedPassword}
                setPassword={setPassword}
                setRepeatedPassword={setRepeatedPassword}
                loading={loading}
                // isInvalid={!isPasswordValid || !passwordMatch} // Pass validation status
            />
            <UsernameInput
                value={username}
                onChange={setUsername}
                onValidate={setUsernameValid} // Receives validation from UsernameInput
                disabled={loading}
            />

            {/* Profile Details */}
            <BirthDateSelector
                birthDate={birthDateUi}
                onChange={setBirthDateUi}
                onValidate={setIsBirthDateValid} // Receives validation from BirthDateSelector
                required={true} // Mark as required for clarity, though actual validation is internal
                minAge={18}
                maxAge={120}
                // isInvalid={!isBirthDateValid} // Pass validation status
            />
            <NameInput
                value={name}
                onChange={setName}
                onValidate={setNameValid} // Receives validation from NameInput
                disabled={loading}
                // isInvalid={!nameValid} // Pass validation status
            />
            <AgeRangeSelector
                userAge={null} // Not directly used in registration, maybe remove? Or pass a derived age from birthDateUi
                onChange={setpreferedAgeRange}
                // selectedRange={preferedAgerange} // Pass current selected range
            />
            <GenderSelector
                onChange={setGender}
                selected={gender}
                isEditable={!loading}
            />
            <HeightSet
                height={height}
                setHeight={setHeight}
                isEditable={!loading}
            />
            <Description
                description={description}
                setDescription={setDescription}
            />
            <ImageUpload
                image={image}
                setImage={setImage}
                displayed={true}
                disabled={loading}
                onClearImage={() => setImage(null)}
                currentProfilePicture={undefined} // No current picture for registration
            />

            {/* Location and Preferences */}
            <LocationSelector
                value={locationCityName}
                onChange={handleLocationChange}
                lat={locationCoordinates?.lat || null}
                lng={locationCoordinates?.lng || null}
                googlePlaceId={googlePlaceId}
                isGpsUsed={isGpsUsed}
                isEditable={!loading}
                isInvalid={!isLocationValid} // Pass validation status
            />

            <RadiusSelector
                radius={radius}
                setRadius={setRadius}
                isEditable={!loading}
            />

            <PreferredGenderSelector
                onChange={setPreferredGenders}
                selected={preferredGenders}
                isEditable={!loading}
            />

            <Form.Group className="mb-3">
                <Form.Label>Interested Games</Form.Label>
                <div className="mb-2">
                    <GameSelector
                        allGames={games}
                        selectedGameIds={selectedGameIdsForSelector}
                        onToggle={handleGamesChange}
                        disabled={loading}
                    />
                </div>
            </Form.Group>


            <Button
                variant="success"
                type="submit"
                disabled={loading || !isFormValid}
            >
                {loading ? (
                    <>
                        <Spinner animation="border" size="sm" /> Creating...
                    </>
                ) : (
                    "Create Account"
                )}
            </Button>
        </Form>
    );
};

export default RegisterForm;