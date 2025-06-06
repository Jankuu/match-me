// RegisterForm.tsx
import React, { useState, useEffect, useCallback } from "react"; // Added useCallback
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
import { Game } from "../../dto/Game"; // Ensure this import is correct
import axios from "axios";
import "../../styles/GameSelector.css";
import BirthDateSelector from "../formComponents/BirthdateSelector";
import GameSelector from "../formComponents/GameSelector";
import RadiusSelector from "../formComponents/RadiusSelector";

type Props = {
    onSubmit: (data: UserRegistrationDTO) => void;
    loading: boolean;
};

const RegisterForm = ({ onSubmit, loading }: Props) => {
    // ... (all your existing state variables)
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [repeatedEmail, setRepeatedEmail] = useState("");
    const [password, setPassword] = useState("");
    const [repeatedPassword, setRepeatedPassword] = useState("");

    const [name, setName] = useState<string>("");
    const [image, setImage] = useState<File | null>(null);
    const [birthDateUi, setBirthDateUi] = useState<string>("");
    const [gender, setGender] = useState("man");
    const [height, setHeight] = useState<number>(150);
    const [description, setDescription] = useState<string>("");

    const [ages, setAges] = useState<[number, number]>([18, 120]);
    const [preferredGendersArray, setPreferredGendersArray] = useState<string[]>(["man", "woman"]);

    const [location, setLocation] = useState("");
    const [placeId, setPlaceId] = useState<string | undefined>(undefined);
    const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | undefined>(undefined);
    const [isGpsUsed, setIsGpsUsed] = useState(false);
    const [radius, setRadius] = useState<number>(5000);

    const [age, setAge] = useState<number | null>(null);

    const [usernameValid, setUsernameValid] = useState(false);
    const [nameValid, setNameValid] = useState(false);

    const isPasswordValid = /^(?=.*[A-Za-z])(?=.*\d).{6,}$/.test(password);
    const passwordMatch = password.length > 0 && repeatedPassword === password;

    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const emailMatch = email.length > 0 && repeatedEmail === email;

    const [games, setGames] = useState<Game[]>([]);
    const [selectedGames, setSelectedGames] = useState<Set<Game>>(new Set()); // This stores Game objects

    const [isBirthDateValid, setIsBirthDateValid] = useState(false);

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

    // Function to toggle selection of a game
    // Memoize this function to prevent unnecessary re-renders of GameSelector if possible
    const toggleGame = useCallback((game: Game) => {
        setSelectedGames((prev) => {
            const newSet = new Set(prev);
            // We need to check if the game with the same ID already exists in the set
            // because Set.has() checks for object reference equality.
            let gameExistsInSet = false;
            for (let item of newSet) { //error here wil be fixed but code works
                if (item.id === game.id) {
                    gameExistsInSet = true;
                    break;
                }
            }

            if (gameExistsInSet) {
                // If game is already selected, remove it by ID
                const filteredSet = new Set<Game>();
                newSet.forEach(item => {
                    if (item.id !== game.id) {
                        filteredSet.add(item);
                    }
                });
                return filteredSet;
            } else {
                // If game is not selected, add it
                newSet.add(game);
            }
            return newSet;
        });
    }, []); // Empty dependency array as setSelectedGames is stable

    // Derived state for GameSelector: a Set of game IDs
    const selectedGameIdsForSelector = React.useMemo(() => {
        return new Set(Array.from(selectedGames).map(game => game.id));
    }, [selectedGames]);


    const isFormValid =
        (((isEmailValid && emailMatch) || usernameValid) ||
        ((isEmailValid && emailMatch) && usernameValid)) &&
        (passwordMatch && isPasswordValid);

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
            interestedMinAge: ages[0],
            interestedMaxAge: ages[1],
            interestedGenders: preferredGendersArray,
            interestedGames: Array.from(selectedGames.values()), // Still send Game objects to DTO

            isGpsUser: isGpsUsed,
            cityName: location,
            googlePlaceId: placeId,
            lat: coordinates?.lat,
            lng: coordinates?.lng,
            radius: radius,
        };

        onSubmit(userPayload);
    };

    return (
        <Form onSubmit={handleSubmit}>
            {/* ... (your existing form components) */}
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
            <BirthDateSelector
                birthDate={birthDateUi}
                onChange={setBirthDateUi}
                onValidate={setIsBirthDateValid}
                required={true}
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
                onChange={setAges}
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
            <LocationSelector
                value={location}
                onChange={(value, placeId, coords, gpsUsed) => {
                    setLocation(value);
                    setPlaceId(placeId);
                    setCoordinates(coords);
                    setIsGpsUsed(gpsUsed || false);
                }}
            />
            <RadiusSelector
                radius={radius}
                setRadius={(value) => setRadius(value)}
                isEditable={true}
            />
            <PreferredGenderSelector
                onChange={setPreferredGendersArray}
                selected={preferredGendersArray}
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
                onClearImage={function (): void {
                    // Implement this if needed for registration form to clear image.
                    // Or remove it if this prop is not relevant here.
                    // For now, it will throw an error if called.
                }}
                currentProfilePicture={undefined}
            />

            {/* Game selector component */}
            <GameSelector
                games={games}
                selectedGameIds={selectedGameIdsForSelector} // Pass the Set of IDs here
                onToggle={toggleGame}
                disabled={false}
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