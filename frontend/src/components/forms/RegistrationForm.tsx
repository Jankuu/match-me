import { useState, useEffect } from "react";
import { Button, Form, InputGroup, Spinner } from "react-bootstrap";
import NameInput from "../formComponents/NameInput";
import EmailInput from "../formComponents/EmailInput";
import PasswordInput from "../formComponents/PasswordInput";
import AgeRangeSelector from "../formComponents/AgeRangeSelector";
import PreferredGenderSelector from "../formComponents/PreferredGenderSelector";
import ImageUpload from "../formComponents/ImageUpload";
import LocationSelector from "../formComponents/LocationSelector";
import GenderSelector from "../formComponents/GenderSelection";
import HeightSet from "../formComponents/HeightSet";
import Description from "../formComponents/Description";
import { UserRegistrationDTO } from "../../dto/UserRegistrationDTO";
import UsernameInput from "../formComponents/UsernameInput";
import { Game } from "../../dto/Game";
import axios from "axios"; // Import axios for fetching games
import "../../styles/GameSelector.css"; // Styles for game selection
import BirthDateSelector from "../formComponents/BirthdateSelector";
import GameSelector from "../formComponents/GameSelector";
import RadiusSelector from "../formComponents/RadiusSelector";

// Define the props for the RegisterForm component
type Props = {
    onSubmit: (data: UserRegistrationDTO) => void; // Function to call when the form is submitted
    loading: boolean; // Boolean indicating if the form is currently submitting
};

const RegisterForm = ({ onSubmit, loading }: Props) => {
    // State variables for user authentication details
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [repeatedEmail, setRepeatedEmail] = useState("");
    const [password, setPassword] = useState("");
    const [repeatedPassword, setRepeatedPassword] = useState("");

    // State variables for user profile details
    const [name, setName] = useState<string>("");
    const [image, setImage] = useState<File | null>(null); // For profile picture upload
    const [birthDateUi, setBirthDateUi] = useState<string>(""); // Birthdate as a string for UI display
    const [birthDateError, setBirthDateError] = useState<string>(""); // Error message for birthdate validation
    const [gender, setGender] = useState("man"); // User's gender
    const [height, setHeight] = useState<number>(150); // User's height in cm
    const [description, setDescription] = useState<string>(""); // User's self-description

    // State variables for user preferences (for matching)
    const [ages, setAges] = useState<[number, number]>([18, 120]); // Age range for matches
    const [preferredGendersArray, setPreferredGendersArray] = useState<
        string[]
    >(["man", "woman"]); // Preferred genders for matches, both by default

    const [location, setLocation] = useState(""); // User's location (city name)
    const [placeId, setPlaceId] = useState<string | undefined>(undefined); // Google Place ID for the location
    const [coordinates, setCoordinates] = useState<
        { lat: number; lng: number } | undefined
    >(undefined); // Lat/Lng coordinates of the location
    const [isGpsUsed, setIsGpsUsed] = useState(false); // Flag indicating if GPS was used for location
    const [radius, setRadius] = useState<number>(5000); // Search radius for matches in meters

    const [age, setAge] = useState<number | null>(null); // Calculated age based on birthdate

    // State variables for input validation status
    const [usernameValid, setUsernameValid] = useState(false); // Indicates if username input is valid
    const [nameValid, setNameValid] = useState(false); // Indicates if name input is valid

    // Derived validation states for password and email
    const isPasswordValid = /^(?=.*[A-Za-z])(?=.*\d).{6,}$/.test(password); // Regex for strong password
    const passwordMatch = password.length > 0 && repeatedPassword === password; // Check if passwords match

    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); // Regex for valid email format
    const emailMatch = email.length > 0 && repeatedEmail === email; // Check if emails match

    // State variables for game selection
    const [games, setGames] = useState<Game[]>([]); // List of all available games from API
    const [selectedGames, setSelectedGames] = useState<Set<Game>>(new Set()); // Set of games selected by the user

    // Effect hook to fetch games from the API on component mount
    useEffect(() => {
        axios
            .get<Game[]>("http://localhost:8080/games") // API endpoint to fetch games
            .then((response) => {
                setGames(response.data); // Set the fetched games to state
            })
            .catch((error) => {
                console.error("Error fetching games:", error); // Log any errors during game fetching
            });
    }, []); // Empty dependency array ensures this runs only once

    // Function to toggle selection of a game
    const toggleGame = (game: Game) => {
        setSelectedGames((prev) => {
            const newSet = new Set(prev); // Create a new set to avoid direct mutation
            if (newSet.has(game)) {
                newSet.delete(game); // If game is already selected, remove it
            } else {
                newSet.add(game); // If game is not selected, add it
            }
            return newSet; // Return the updated set
        });
    };

    // Effect hook to calculate age and validate birthdate
    useEffect(() => {
        if (birthDateUi) {
            const birth = new Date(birthDateUi);
            const today = new Date();
            let userAge = today.getFullYear() - birth.getFullYear();
            const monthDiff = today.getMonth() - birth.getMonth();
            if (
                monthDiff < 0 ||
                (monthDiff === 0 && today.getDate() < birth.getDate())
            ) {
                userAge--; // Adjust age if birth month/day hasn't occurred yet this year
            }
            setAge(userAge); // Set the calculated age

            // Validate age to be within 18 and 120
            if (userAge < 18 || userAge > 120) {
                setBirthDateError("You must be between 18 and 120 years old.");
            } else {
                setBirthDateError(""); // Clear error if age is valid
            }
        } else {
            setAge(null); // Clear age if birthdate is empty
            setBirthDateError(""); // Clear birthdate error
        }
    }, [birthDateUi]); // Rerun when birthDateUi changes

    // Determine if the entire form is valid for submission
    const isFormValid =
        (((isEmailValid && emailMatch) || usernameValid) || // Either valid email or valid username
        ((isEmailValid && emailMatch) && usernameValid)) && // Or both valid email and valid username
        (passwordMatch && isPasswordValid); // And passwords match and are valid

    // Function to read an image file as Base64 string
    const readImageAsBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const result = reader.result as string;
                const base64 = result.split(",")[1]; // Extract Base64 string (remove data URL prefix)
                resolve(base64);
            };
            reader.onerror = reject; // Reject promise on error
            reader.readAsDataURL(file); // Read file as data URL
        });
    };

    // Handler for form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); // Prevent default form submission behavior

        let base64Image: string | undefined = undefined;
        if (image) {
            try {
                base64Image = await readImageAsBase64(image); // Convert image to Base64
            } catch (error) {
                console.error("Failed to read image", error);
                return; // Stop submission if image reading fails
            }
        }

        // Construct the UserRegistrationDTO payload
        const userPayload: UserRegistrationDTO = {
            username,
            email,
            password,
            profile: {
                name: name,
                profilePicture: base64Image, // Base64 encoded profile picture
                birthDate: birthDateUi,
                gender,
                height,
                description,
            },
            interestedMinAge: ages[0],
            interestedMaxAge: ages[1],
            interestedGenders: preferredGendersArray,
            interestedGames: Array.from(selectedGames.values()), // Convert Set to Array for DTO

            isGpsUser: isGpsUsed,
            cityName: location,
            googlePlaceId: placeId,
            lat: coordinates?.lat, // Latitude from coordinates
            lng: coordinates?.lng, // Longitude from coordinates
            radius: radius,
        };

        onSubmit(userPayload); // Call the onSubmit prop with the constructed payload
    };

    return (
        <Form onSubmit={handleSubmit}>
            {/* Email input component */}
            <EmailInput
                email={email}
                repeatedEmail={repeatedEmail}
                setEmail={setEmail}
                setRepeatedEmail={setRepeatedEmail}
                loading={loading}
            />

            {/* Password input component */}
            <PasswordInput
                password={password}
                repeatedPassword={repeatedPassword}
                setPassword={setPassword}
                setRepeatedPassword={setRepeatedPassword}
                loading={loading}
            />

            {/* Username input component */}
            <UsernameInput
                value={username}
                onChange={setUsername}
                onValidate={setUsernameValid} // Callback for username validation status
                disabled={loading}
            />

            {/* Birth date selector component */}
            <BirthDateSelector
                birthDate={birthDateUi}
                onChange={setBirthDateUi}
            />

            {/* Name input component */}
            <NameInput
                value={name}
                onChange={setName}
                onValidate={setNameValid} // Callback for name validation status
                disabled={loading}
            />

            {/* Age range selector for matching preferences */}
            <AgeRangeSelector
                userAge={age}
                onChange={setAges}
            />

            {/* Gender selector for user's own gender */}
            <GenderSelector
                onChange={setGender}
                selected={gender}
                isEditable={true}
            />
            {/* Height input component */}
            <HeightSet
                height={height}
                setHeight={setHeight}
                isEditable={true}
            />
            {/* Location selector component */}
            <LocationSelector
                value={location}
                onChange={(value, placeId, coords, gpsUsed) => {
                    setLocation(value);
                    setPlaceId(placeId);
                    setCoordinates(coords);
                    setIsGpsUsed(gpsUsed || false); // Set GPS used flag
                }}
            />
            {/* Radius selector for search proximity */}
            <RadiusSelector
                radius={radius}
                setRadius={(value) => setRadius(value)}
                isEditable={true}
            />
            {/* Preferred gender selector for matching preferences */}
            <PreferredGenderSelector
                onChange={setPreferredGendersArray}
                selected={preferredGendersArray}
                isEditable={true}
            />

            {/* Description input component */}
            <Description
                description={description}
                setDescription={setDescription}
            />

            {/* Image upload component for profile picture */}
            <ImageUpload
                image={image}
                setImage={setImage}
                displayed={true}
            />

            {/* Game selector component */}
            <GameSelector
                games={games}
                selectedGames={selectedGames}
                onToggle={toggleGame}
                disabled={false} // Enable/disable game selection
            />

            {/* Submit button for the form */}
            <Button
                variant="success"
                type="submit"
                disabled={loading || !isFormValid} // Disable if loading or form is invalid
            >
                {loading ? (
                    <>
                        <Spinner animation="border" size="sm" /> Creating...
                    </>
                ) : (
                    "Create Account" // Button text based on loading state
                )}
            </Button>
        </Form>
    );
};

export default RegisterForm;