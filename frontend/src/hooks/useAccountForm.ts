import { useState, useEffect, useCallback, useMemo } from "react";
import { User } from "../types/User";
import { Game } from "../types/Game";
import { Coordinates } from "../types/Cordinates"; // Ensure this import path is correct

/**
 * Defines the parameters for the useAccountForm hook.
 * These are essentially the props that the AccountForm component would pass down,
 * allowing the hook to interact with the parent's data and update functions.
 */
interface UseAccountFormProps {
    profile: User;
    editing: boolean;
    allAvailableGames: Game[];
    onProfileChange: (field: keyof User["profile"], value: any) => void;
    onRootChange: (field: Exclude<keyof User, 'profile'>, value: any) => void;
    onFormValidationChange: (isValid: boolean) => void;
    onBirthDateValidationChange: (isValid: boolean) => void;
}

/**
 * useAccountForm Custom Hook
 * Manages the internal state, validation, and change handlers for the AccountForm.
 * It abstracts away the complex logic, providing a clean interface for the UI component.
 */
const useAccountForm = ({
    profile,
    editing,
    allAvailableGames,
    onProfileChange,
    onRootChange,
    onFormValidationChange,
    onBirthDateValidationChange,
}: UseAccountFormProps) => {
    // --- Internal States for Form Field Validation & Specifics ---
    // These states manage the UI-specific values and validation status
    // that are derived from or related to the 'profile' prop.
    const [locationString, setLocationString] = useState<string>(profile.cityName || "");
    const [locationCoordinates, setLocationCoordinates] = useState<Coordinates | undefined>(
        profile.lat !== null && profile.lng !== null ? { lat: profile.lat, lng: profile.lng } : undefined
    );
    const [locationPlaceId, setLocationPlaceId] = useState<string | undefined>(profile.googlePlaceId || undefined);
    const [isLocationGpsUsedInternal, setIsLocationGpsUsedInternal] = useState<boolean | undefined>(profile.isGpsUser === true);

    // Validation states for required fields, initialized based on current profile data
    const [isNameValid, setIsNameValid] = useState(profile.profile.name.trim().length > 0);
    const [isBirthDateValidInternal, setIsBirthDateValidInternal] = useState(true); // Assuming initially valid until first check
    const [isLocationValid, setIsLocationValid] = useState(true); // Assuming initially valid until first check
    const [isFormValid, setIsFormValid] = useState(false); // Local state to track overall form validity

    /**
     * useEffect: Synchronize internal location states with 'profile' changes from parent.
     * This ensures that if the parent updates the profile, the internal states reflect it.
     */
    useEffect(() => {
        setLocationString(profile.cityName || "");
        setLocationCoordinates(profile.lat !== null && profile.lng !== null ? { lat: profile.lat, lng: profile.lng } : undefined);
        setLocationPlaceId(profile.googlePlaceId || undefined);
        setIsLocationGpsUsedInternal(profile.isGpsUser === true);

        // Re-validate location based on incoming profile data
        const isLocOk = !(profile.cityName && (profile.lat === null || profile.lng === null));
        setIsLocationValid(isLocOk);
    }, [profile.cityName, profile.lat, profile.lng, profile.googlePlaceId, profile.isGpsUser]);

    /**
     * useEffect: Re-evaluate overall form validity whenever relevant dependencies change.
     * This effect calculates the overall validity and notifies the parent component.
     */
    useEffect(() => {
        const overallValid =
            isNameValid &&
            isBirthDateValidInternal &&
            isLocationValid &&
            !!profile.profile.gender && // Ensure gender is selected
            !!profile.interestedGenders?.length && // Ensure preferred genders are selected
            (profile.profile.height !== null && profile.profile.height !== 0) && // Ensure height is set
            (profile.radius !== null && profile.radius !== 0); // Ensure radius is set

        setIsFormValid(overallValid); // Update local state for internal use
        onFormValidationChange(overallValid); // Notify parent component about the overall form validity
    }, [
        isNameValid,
        isBirthDateValidInternal,
        isLocationValid,
        profile.profile.gender,
        profile.interestedGenders,
        profile.profile.height,
        profile.radius,
        onFormValidationChange, // Dependency to re-run if the parent's handler changes (unlikely for stable function)
    ]);

    /**
     * Callback: Handles changes from `LocationSelector` component.
     * Updates internal location states and notifies the parent about root-level changes.
     * Also performs immediate validation for the location field.
     */
    const handleLocationChange = useCallback(
        (
            address: string,
            placeId: string | null,
            coordinates: Coordinates | null,
            isGpsUser: boolean | null
        ) => {
            // Update internal states used for rendering LocationSelector and its feedback
            setLocationString(address);
            setLocationPlaceId(placeId === null ? undefined : placeId);
            setLocationCoordinates(coordinates === null ? undefined : coordinates);
            setIsLocationGpsUsedInternal(isGpsUser === true);

            // Notify parent about changes to root-level User properties
            onRootChange("cityName", address);
            onRootChange("googlePlaceId", placeId);
            onRootChange("lat", coordinates ? coordinates.lat : null);
            onRootChange("lng", coordinates ? coordinates.lng : null);
            onRootChange("isGpsUser", isGpsUser === true);

            // Validate location: if an address is provided, coordinates must be present
            const isValid = !(address.length > 0 && (!coordinates || coordinates.lat === null || coordinates.lng === null));
            setIsLocationValid(isValid); // Update internal validation state
        },
        [onRootChange] // Dependency: onRootChange (stable function)
    );

    /**
     * Callback: Handles changes to the birth date input.
     * Updates the profile and performs validation for age (min 18 years old) and future dates.
     */
    const handleBirthDateChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const newDate = e.target.value;
            onProfileChange("birthDate", newDate); // Notify parent about profile.birthDate change

            const birthDate = new Date(newDate);
            const today = new Date();
            const minDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());

            // Validate: birth date must not be in the future and user must be at least 18
            const isValid = birthDate <= today && birthDate <= minDate;
            setIsBirthDateValidInternal(isValid); // Update internal validation state
            onBirthDateValidationChange(isValid); // Notify parent about birth date validity
        },
        [onProfileChange, onBirthDateValidationChange] // Dependencies
    );

    /**
     * Callback: Handles changes to the user's name input.
     * Updates the profile and validates that the name is not empty.
     */
    const handleNameChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const newName = e.target.value;
            onProfileChange("name", newName); // Notify parent about profile.name change
            setIsNameValid(newName.trim().length > 0); // Validate: name must not be empty
        },
        [onProfileChange] // Dependency
    );

    /**
     * Callback: Handles changes in game selection from `GameSelector`.
     * Converts selected game IDs back to Game objects and updates the root-level interestedGames.
     */
    const handleGamesChange = useCallback(
        (newSelectedGameIds: Set<number>) => {
            // Map selected IDs back to full Game objects using the allAvailableGames array
            const updatedGames = Array.from(newSelectedGameIds).map(id => {
                const game = allAvailableGames.find(g => g.id === id);
                // Provide a fallback Game object if not found (though it should be if allAvailableGames is comprehensive)
                return game || { id: id, name: `Unknown Game ${id}` };
            });
            onRootChange("interestedGames", updatedGames); // Notify parent about root.interestedGames change
        },
        [onRootChange, allAvailableGames] // Dependencies: allAvailableGames for mapping, onRootChange for notification
    );

    /**
     * Callback: Handles changes to the radius input from `RadiusSelector`.
     * Updates the root-level radius.
     */
    const handleRadiusChange = useCallback(
        (newRadius: number) => {
            onRootChange("radius", newRadius); // Notify parent about root.radius change
        },
        [onRootChange] // Dependency
    );

    /**
     * Callback: Handles changes to the user's gender from `GenderSelector`.
     * Updates the profile-level gender.
     */
    const handleGenderChange = useCallback(
        (gender: string) => {
            onProfileChange("gender", gender); // Notify parent about profile.gender change
        },
        [onProfileChange] // Dependency
    );

    /**
     * Callback: Handles changes to preferred genders from `PreferredGenderSelector`.
     * Updates the root-level interestedGenders.
     */
    const handlePreferredGenderChange = useCallback(
        (genders: string[]) => {
            onRootChange("interestedGenders", genders); // Notify parent about root.interestedGenders change
        },
        [onRootChange] // Dependency
    );

    /**
     * Callback: Handles changes to the description input.
     * Updates the profile-level description.
     */
    const handleDescriptionChange = useCallback(
        (description: string) => {
            onProfileChange("description", description); // Notify parent about profile.description change
        },
        [onProfileChange] // Dependency
    );

    /**
     * Callback: Handles changes to the height input from `HeightSet`.
     * Updates the profile-level height.
     */
    const handleHeightChange = useCallback(
        (height: number) => {
            onProfileChange("height", height); // Notify parent about profile.height change
        },
        [onProfileChange] // Dependency
    );

    /**
     * Memoized value: Determines if the Save Changes button should be disabled.
     * The button is disabled if:
     * - The form is not in editing mode.
     * - The overall form validation (`isFormValid`) is false.
     * - The profile ID is null (indicating a new, unsaved profile, though this logic might be more relevant for registration).
     */
    const isSaveDisabled = useMemo(() => {
        return !editing || !isFormValid || profile.id === null;
    }, [editing, isFormValid, profile.id]);

    // Return all the state and handlers needed by the AccountForm component
    return {
        // Internal states relevant to UI (e.g., for showing feedback)
        locationString,
        locationCoordinates,
        locationPlaceId,
        isLocationGpsUsedInternal,
        isNameValid,
        isBirthDateValidInternal,
        isLocationValid,
        isFormValid, // Though primarily used internally by the hook, it can be exposed

        // Callbacks for form component handlers
        handleLocationChange,
        handleBirthDateChange,
        handleNameChange,
        handleGamesChange,
        handleRadiusChange,
        handleGenderChange,
        handlePreferredGenderChange,
        handleDescriptionChange,
        handleHeightChange,

        // Derived values for UI
        isSaveDisabled,
    };
};

export default useAccountForm;