import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Button, Form, InputGroup, Spinner } from "react-bootstrap";
import NameInput from "../formComponents/NameInput";
import EmailInput from "../formComponents/EmailInput";
import PasswordInput from "../formComponents/PasswordInput";
import AgeRangeSelector from "../formComponents/AgeRangeSelector";
import PreferredGenderSelector from "../formComponents/PreferredGenderSelector";
import ImageUpload from "../formComponents/ImageUpload";
import LocationSelector from "../formComponents/LocationSelector";
import HeightSet from "../formComponents/HeightSet";
import Description from "../formComponents/Description";
import { UserRegistrationDTO } from "../../dto/UserRegistrationDTO";
import UsernameInput from "../formComponents/UsernameInput";
import { Game } from "../../dto/Game";
import axios from "axios";
import "../../styles/GameSelector.css";
import BirthDateSelector from "../formComponents/BirthdateSelector";
import GameSelector from "../formComponents/GameSelector"; // Import GameSelector
import RadiusSelector from "../formComponents/RadiusSelector";
import { Coordinates } from "../../types/Cordinates";
import GenderSelector from "../formComponents/GernderSelector";

/**
 * Props for the RegisterForm component.
 * @param onSubmit A callback function that takes UserRegistrationDTO and is called when the form is submitted.
 * @param loading A boolean indicating if the submission process is ongoing, used to disable the form.
 */
type Props = {
    onSubmit: (data: UserRegistrationDTO) => void;
    loading: boolean;
};

/**
 * RegisterForm component.
 * This component renders the entire registration form, manages all its internal state,
 * performs client-side validation, and prepares the data for submission.
 */
const RegisterForm = ({ onSubmit, loading }: Props) => {
    // --- User Account Details ---
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [repeatedEmail, setRepeatedEmail] = useState("");
    const [password, setPassword] = useState("");
    const [repeatedPassword, setRepeatedPassword] = useState("");

    // --- User Profile Details ---
    const [name, setName] = useState<string>("");
    const [image, setImage] = useState<File | null>(null);
    const [birthDateUi, setBirthDateUi] = useState<string>("");
    const [gender, setGender] = useState("man");
    const [height, setHeight] = useState<number>(150);
    const [description, setDescription] = useState<string>("");

    // --- User Preferences for Matching ---
    const [preferedAgerange, setpreferedAgeRange] = useState<[number, number]>([18, 120]);
    const [preferredGenders, setPreferredGenders] = useState<string[]>([
        "man",
        "woman",
    ]);

    // --- User Location Details ---
    const [locationCityName, setLocationCityName] = useState<string>("");
    const [googlePlaceId, setGooglePlaceId] = useState<string | null>(null);
    const [locationCoordinates, setLocationCoordinates] = useState<Coordinates | null>(null);
    const [isGpsUsed, setIsGpsUsed] = useState<boolean | null>(null);
    const [radius, setRadius] = useState<number>(5000);

    // --- Auxiliary State for Validation / Derived Values ---
    const [age, setAge] = useState<number | null>(null);

    // Validation states for specific inputs
    const [usernameValid, setUsernameValid] = useState(false);
    const [nameValid, setNameValid] = useState(false);
    const [isBirthDateValid, setIsBirthDateValid] = useState(false);
    const [isLocationValid, setIsLocationValid] = useState(false);

    // Derived validation for password strength and match
    const isPasswordValid = /^(?=.*[A-Za-z])(?=.*\d).{6,}$/.test(password);
    const passwordMatch = password.length > 0 && repeatedPassword === password;

    // Derived validation for email format and match
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const emailMatch = email.length > 0 && repeatedEmail === email;

    // --- Games Selection ---
    const [games, setGames] = useState<Game[]>([]); // List of all available games from API
    // Set to store selected Game objects
    const [selectedGames, setSelectedGames] = useState<Set<Game>>(new Set());

    /**
     * useEffect hook to fetch the list of available games from the backend.
     */
    useEffect(() => {
        axios
            .get<Game[]>("http://localhost:8080/games")
            .then((response) => {
                setGames(response.data);
            })
            .catch((error) => {
                console.error("Error fetching games:", error);
            });
    }, []);

    /**
     * Callback function to handle changes in selected game IDs from GameSelector.
     * It maps the selected IDs back to Game objects to update the internal selectedGames state.
     */
    const handleGamesChange = useCallback((newSelectedGameIds: Set<number>) => {
        setSelectedGames(() => {
            const updatedGamesSet = new Set<Game>();
            // Iterate through all available games to find the ones matching selected IDs
            games.forEach(game => {
                if (newSelectedGameIds.has(game.id)) {
                    updatedGamesSet.add(game);
                }
            });
            return updatedGamesSet;
        });
    }, [games]); // Dependency on 'games' is important to map IDs back to correct Game objects

    /**
     * Memoized derived state: A Set of *game IDs* for the `GameSelector` component.
     */
    const selectedGameIdsForSelector = useMemo(() => {
        return new Set(Array.from(selectedGames).map(game => game.id));
    }, [selectedGames]);

    /**
     * Callback for handling location changes from `LocationSelector`.
     * Updates internal location states and `isLocationValid` state.
     */
    const handleLocationChange = useCallback(
        (address: string, placeIdResult: string | null, coordsResult: Coordinates | null, gpsUsedResult: boolean | null) => {
            setLocationCityName(address);
            setGooglePlaceId(placeIdResult);
            setLocationCoordinates(coordsResult);
            setIsGpsUsed(gpsUsedResult);

            const isValid =
                (address.trim().length > 0 && coordsResult !== null && placeIdResult !== null) ||
                (address.trim().length === 0 && coordsResult === null && placeIdResult === null);

            setIsLocationValid(isValid);
        },
        []
    );

    /**
     * Overall form validation.
     * Checks all required fields for validity.
     */
    const isFormValid =
        (((isEmailValid && emailMatch) || usernameValid) ||
        ((isEmailValid && emailMatch) && usernameValid)) &&
        (passwordMatch && isPasswordValid);
        // nameValid &&
        // isBirthDateValid &&
        // gender.trim().length > 0 &&
        // height > 0 &&
        // description.trim().length > 0 &&
        // isLocationValid &&
        // radius > 0 &&
        // preferredGenders.length > 0;

    /**
     * Helper function to read an image file and convert it to a Base64 string.
     */
    const readImageAsBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const result = reader.result as string;
                const base64 = result.split(",")[1];
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    /**
     * Handles the overall form submission.
     */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        let base64Image: string | undefined = undefined;
        if (image) {
            try {
                base64Image = await readImageAsBase64(image);
            } catch (error) {
                console.error("Failed to read image", error);
                return;
            }
        }

        const userPayload: UserRegistrationDTO = {
            username,
            email,
            password,
            profile: {
                name: name,
                profilePicture: base64Image,
                birthDate: birthDateUi,
                gender,
                height,
                description,
            },
            interestedMinAge: preferedAgerange[0],
            interestedMaxAge: preferedAgerange[1],
            interestedGenders: preferredGenders,
            interestedGames: Array.from(selectedGames.values()), // Convert Set<Game> to Game[] for DTO

            isGpsUser: isGpsUsed === true,
            cityName: locationCityName,
            googlePlaceId: googlePlaceId || undefined,
            lat: locationCoordinates?.lat || undefined,
            lng: locationCoordinates?.lng || undefined,
            radius: radius,
        };

        onSubmit(userPayload);
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
            />
            <PasswordInput
                password={password}
                repeatedPassword={repeatedPassword}
                setPassword={setPassword}
                setRepeatedPassword={setRepeatedPassword}
                loading={loading}
            />
            <UsernameInput
                value={username}
                onChange={setUsername}
                onValidate={setUsernameValid}
                disabled={loading}
            />

            {/* Profile Details */}
            <BirthDateSelector
                birthDate={birthDateUi}
                onChange={setBirthDateUi}
                onValidate={setIsBirthDateValid}
                required={false}
                minAge={18}
                maxAge={120}
            />
            <NameInput
                value={name}
                onChange={setName}
                onValidate={setNameValid}
                disabled={loading}
            />
            <AgeRangeSelector
                userAge={age}
                onChange={setpreferedAgeRange}
            />
            <GenderSelector
                onChange={setGender}
                selected={gender}
                isEditable={true}
            />
            <HeightSet
                height={height}
                setHeight={setHeight}
                isEditable={true}
            />
            <Description
                description={description}
                setDescription={setDescription}
            />
            <ImageUpload
                image={image}
                setImage={setImage}
                displayed={true}
                disabled={false}
                onClearImage={() => setImage(null)}
                currentProfilePicture={undefined}
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
                isInvalid={!isLocationValid}
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

            <GameSelector
                allGames={games} // All available games
                selectedGameIds={selectedGameIdsForSelector} // IDs of currently selected games
                onToggle={handleGamesChange} // Use the new handler
                disabled={loading}
            />

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