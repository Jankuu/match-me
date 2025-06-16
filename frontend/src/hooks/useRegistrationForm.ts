import { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { UserRegistration } from "../types/UserRegistration";
import { Game } from "../types/Game";
import { Coordinates } from "../types/Cordinates"; // Ensure this path is correct

/**
 * Defines the parameters for the useRegistrationForm hook.
 */
interface UseRegistrationFormProps {
    // No direct props needed from parent for this hook, as it manages all its own internal state.
    // It will return the final payload and a submit handler.
}

/**
 * useRegistrationForm Custom Hook
 * Manages all internal state, client-side validation, and data preparation for the user registration form.
 * It provides a clean interface for the RegisterForm UI component to render and handle user input.
 */
const useRegistrationForm = ({}: UseRegistrationFormProps = {}) => {
    // --- User Account Details States ---
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [repeatedEmail, setRepeatedEmail] = useState("");
    const [password, setPassword] = useState("");
    const [repeatedPassword, setRepeatedPassword] = useState("");

    // --- User Profile Details States ---
    const [name, setName] = useState<string>("");
    const [image, setImage] = useState<File | null>(null);
    const [birthDateUi, setBirthDateUi] = useState<string>(""); // UI representation of birth date (e.g., "YYYY-MM-DD")
    const [gender, setGender] = useState("man"); // Default gender
    const [height, setHeight] = useState<number>(150); // Default height
    const [description, setDescription] = useState<string>("");

    // --- User Preferences for Matching States ---
    const [preferedAgerange, setpreferedAgeRange] = useState<[number, number]>([18, 120]); // Default age range
    const [preferredGenders, setPreferredGenders] = useState<string[]>([
        "man",
        "woman",
    ]); // Default preferred genders

    // --- User Location Details States ---
    const [locationCityName, setLocationCityName] = useState<string>("");
    const [googlePlaceId, setGooglePlaceId] = useState<string | null>(null);
    const [locationCoordinates, setLocationCoordinates] = useState<Coordinates | null>(null);
    const [isGpsUser, setIsGpsUser] = useState<boolean | null>(null);
    const [radius, setRadius] = useState<number>(5000); // Default search radius

    // --- Auxiliary State for Validation / Derived Values ---
    const [games, setGames] = useState<Game[]>([]); // List of all available games fetched from API
    const [selectedGames, setSelectedGames] = useState<Set<Game>>(new Set()); // Set to store selected Game objects

    // Validation states for specific inputs, managed by child components
    const [usernameValid, setUsernameValid] = useState(false);
    const [nameValid, setNameValid] = useState(false);
    const [isBirthDateValid, setIsBirthDateValid] = useState(false);
    const [isLocationValid, setIsLocationValid] = useState(false);

    /**
     * useEffect hook to fetch the list of available games from the backend when the hook mounts.
     */
    useEffect(() => {
        axios
            .get<Game[]>("http://localhost:8080/games") // Adjust URL as per your API
            .then((response) => {
                setGames(response.data);
            })
            .catch((error) => {
                console.error("Error fetching games:", error);
                // Handle error appropriately, e.g., display a message to the user
            });
    }, []); // Empty dependency array means this runs once on mount

    /**
     * Callback function to handle changes in selected game IDs from `GameSelector`.
     * It maps the selected IDs back to `Game` objects to update the internal `selectedGames` state.
     * Memoized to prevent unnecessary re-creations.
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
    }, [games]); // Dependency on 'games' is crucial to map IDs back to correct Game objects

    /**
     * Memoized derived state: A Set of *game IDs* for the `GameSelector` component.
     * This is efficient as it only re-calculates when `selectedGames` changes.
     */
    const selectedGameIdsForSelector = useMemo(() => {
        return new Set(Array.from(selectedGames).map(game => game.id));
    }, [selectedGames]);

    /**
     * Callback for handling location changes from `LocationSelector`.
     * Updates internal location states and performs immediate validation for the location field.
     * Memoized to prevent unnecessary re-creations.
     */
    const handleLocationChange = useCallback(
        (address: string, placeIdResult: string | null, coordsResult: Coordinates | null, gpsUserResult: boolean | null) => {
            setLocationCityName(address);
            setGooglePlaceId(placeIdResult);
            setLocationCoordinates(coordsResult);
            setIsGpsUser(gpsUserResult);

            // Location is valid if:
            // 1. An address is provided AND coordinates/placeId are also provided.
            // OR
            // 2. No address is provided AND no coordinates/placeId are provided (meaning user left it empty).
            // This prevents an address being entered without valid geographical data.
            const isValid =
                (address.trim().length > 0 && coordsResult !== null && placeIdResult !== null) ||
                (address.trim().length === 0 && coordsResult === null && placeIdResult === null);

            setIsLocationValid(isValid);
        },
        [] // No dependencies, as it only uses local state setters
    );

    // --- Derived Validation States ---
    const isPasswordValid = useMemo(() => /^(?=.*[A-Za-z])(?=.*\d).{6,}$/.test(password), [password]);
    const passwordMatch = useMemo(() => password.length > 0 && repeatedPassword === password, [password, repeatedPassword]);

    const isEmailValid = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email), [email]);
    const emailMatch = useMemo(() => email.length > 0 && repeatedEmail === email, [email, repeatedEmail]);

    // Overall form validity check. All required fields must be valid.
    // The commented-out fields below suggest they are optional or have complex interdependent validation,
    // which should be defined based on your specific requirements.
    const isFormValid = useMemo(() =>
        (usernameValid || (isEmailValid && emailMatch)) && // Either username valid OR (email valid AND email matches)
        (passwordMatch && isPasswordValid) // Password matches AND is strong
        // name.trim().length > 0 && // Name is required
        // isBirthDateValid && // Birth date valid (age check)
        // gender.trim().length > 0 && // Gender is selected
        // height > 0 && // Height is set
        // isLocationValid && // Location is valid
        // radius > 0 && // Radius is set
        // preferredGenders.length > 0 // At least one preferred gender is selected
    , [
        usernameValid, isEmailValid, emailMatch, passwordMatch, isPasswordValid,
        name, isBirthDateValid, gender, height, isLocationValid, radius, preferredGenders
    ]);


    /**
     * Helper function to read an image file and convert it to a Base64 string.
     * This is an async function because FileReader operations are asynchronous.
     * @param file The File object to read.
     * @returns A Promise that resolves with the Base64 string of the image, or rejects on error.
     */
    const readImageAsBase64 = useCallback((file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const result = reader.result as string;
                // Extract only the Base64 part (after "data:image/jpeg;base64,")
                const base64 = result.split(",")[1];
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }, []); // No dependencies for this utility function

    /**
     * Prepares the UserRegistration payload from the current state.
     * This function should be called within the `handleSubmit` of the UI component
     * and expects to be passed an `onSubmit` prop from the parent.
     * @param onSubmitCallback The callback function from the parent component to submit the data.
     * @returns An async function that can be called to submit the form.
     */
    const prepareAndSubmit = useCallback(async (onSubmitCallback: (data: UserRegistration) => void) => {
        let base64Image: string | undefined = undefined;
        if (image) {
            try {
                base64Image = await readImageAsBase64(image);
            } catch (error) {
                console.error("Failed to read image", error);
                // Optionally, set an error state to display to the user
                return; // Prevent submission if image fails to load
            }
        }

        // Construct the UserRegistration DTO from the internal state
        const userPayload: UserRegistration = {
            username,
            email,
            password,
            profile: {
                name: name,
                profilePicture: base64Image, // Base64 string or undefined
                birthDate: birthDateUi,
                gender,
                height,
                description,
            },
            interestedMinAge: preferedAgerange[0],
            interestedMaxAge: preferedAgerange[1],
            interestedGenders: preferredGenders,
            interestedGames: Array.from(selectedGames.values()), // Convert Set<Game> to Game[] for DTO

            isGpsUser: isGpsUser === true, // Ensure boolean type
            cityName: locationCityName,
            googlePlaceId: googlePlaceId || undefined, // Use undefined if null
            lat: locationCoordinates?.lat || undefined, // Use undefined if null or coordinates are null
            lng: locationCoordinates?.lng || undefined, // Use undefined if null or coordinates are null
            radius: radius,
        };

        // Call the parent's onSubmit callback with the prepared payload
        onSubmitCallback(userPayload);
    }, [
        username, email, password, name, image, birthDateUi, gender, height, description,
        preferedAgerange, preferredGenders, selectedGames, isGpsUser,
        locationCityName, googlePlaceId, locationCoordinates, radius,
        readImageAsBase64 // Dependency for the helper function
    ]);

    // Return all the states, setters, and handlers needed by the RegisterForm UI component
    return {
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
        locationCityName, setLocationCityName, // Added setLocationCityName
        googlePlaceId, setGooglePlaceId, // Added setGooglePlaceId
        locationCoordinates, setLocationCoordinates, // Added setLocationCoordinates
        isGpsUser, setIsGpsUser, // Added setIsGpsUser
        radius, setRadius,
        handleLocationChange, // <--- THIS WAS THE MISSING PIECE!

        // Games
        games, // All available games
        selectedGames, // Current selected games (Set<Game>)
        selectedGameIdsForSelector, // IDs for the selector component
        handleGamesChange, // Handler for games selection

        // Validation States & Derived Values
        usernameValid, setUsernameValid,
        nameValid, setNameValid,
        isBirthDateValid, setIsBirthDateValid,
        isLocationValid, setIsLocationValid, // Added setIsLocationValid
        isPasswordValid, passwordMatch,
        isEmailValid, emailMatch,
        isFormValid, // Overall form validity

        // Submission handler
        prepareAndSubmit,
    };
};

export default useRegistrationForm;