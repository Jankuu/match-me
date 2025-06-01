import { useState, useEffect } from "react";
import { Button, Form, InputGroup, Spinner } from "react-bootstrap";
import NameInput from "./NameInput";
import EmailInput from "./EmailInput";
import PasswordInput from "./PasswordInput";
import AgeRangeSelector from "./AgeRangeSelector";
import PreferredGenderSelector from "./PreferredGenderSelector";
import ImageUpload from "./ImageUpload";
import LocationSelector from "./LocationSelector";
import GenderSelector from "./GenderSelection";
import HeightSet from "./HeightSet";
import Description from "./Description";
import { UserRegistrationDTO } from "../../dto/UserRegistrationDTO";
import { CheckCircleFill, XCircleFill } from "react-bootstrap-icons";
import UsernameInput from "./UsernameInput";
import { Game } from "../../dto/Game";
import axios from "axios";
import "../../styles/GameSelector.css";
import BirthDateSelector from "./BirthdateSelector";
import GameSelector from "./GameSelector";

type Props = {
    onSubmit: (data: UserRegistrationDTO) => void;
    loading: boolean;
};

const RegisterForm = ({ onSubmit, loading }: Props) => {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [repeatedEmail, setRepeatedEmail] = useState("");
    const [password, setPassword] = useState("");
    const [repeatedPassword, setRepeatedPassword] = useState("");

    const [name, setName] = useState("");
    const [image, setImage] = useState<File | null>(null);
    const [birthDateUi, setBirthDateUi] = useState<string>("");
    const [birthDateError, setBirthDateError] = useState<string>("");
    const [gender, setGender] = useState("man");
    const [height, setHeight] = useState<number>(150);
    const [description, setDescription] = useState<string>("");

    const [ages, setAges] = useState<[number, number]>([18, 120]);
    const [preferredGendersArray, setPreferredGendersArray] = useState<
        string[]
    >(["man", "woman"]);
    const [location, setLocation] = useState("");
    const [placeId, setPlaceId] = useState<string | undefined>(undefined);
    const [coordinates, setCoordinates] = useState<
        { lat: number; lng: number } | undefined
    >(undefined);
    const [isGpsUsed, setIsGpsUsed] = useState(false);
    const [radius, setRadius] = useState<number>(5000);
    const [age, setAge] = useState<number | null>(null);

    const [usernameValid, setUsernameValid] = useState(false);
    const [nameValid, setNameValid] = useState(false);

    const isPasswordValid = /^(?=.*[A-Za-z])(?=.*\d).{6,}$/.test(password);
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const emailMatch = email.length > 0 && repeatedEmail === email;
    const passwordMatch = password.length > 0 && repeatedPassword === password;

    // Games
    const [games, setGames] = useState<Game[]>([]);
    const [selectedGames, setSelectedGames] = useState<Set<Game>>(new Set());

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

    const toggleGame = (game: Game) => {
        setSelectedGames((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(game)) {
                newSet.delete(game);
            } else {
                newSet.add(game);
            }
            return newSet;
        });
    };

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
                userAge--;
            }
            setAge(userAge);

            if (userAge < 18 || userAge > 120) {
                setBirthDateError("You must be between 18 and 120 years old.");
            } else {
                setBirthDateError("");
            }
        } else {
            setAge(null);
            setBirthDateError("");
        }
    }, [birthDateUi]);

    const isFormValid =
        (((isEmailValid && emailMatch) || usernameValid) || 
        ((isEmailValid && emailMatch) && usernameValid)) &&
        (passwordMatch && isPasswordValid);
        // age !== null &&
        // age >= 18 &&
        // age <= 120 &&
        // location !== null &&
        // selectedGames !== null;

    const readImageAsBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const result = reader.result as string;
                const base64 = result.split(",")[1]; // remove "data:image/jpeg;base64,"
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // if (!ages) return;

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
            interestedGames: Array.from(selectedGames.values()),

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
                value={radius}
                onChange={setRadius}
                isEditable={true}
            />
            <PreferredGenderSelector
                onChange={setPreferredGendersArray}
                selected={preferredGendersArray} 
                isEditable={false} // fix it
            />

            <Description
                description={description}
                setDescription={setDescription}
            />

            <ImageUpload 
                image={image} 
                setImage={setImage} 
                loading={loading}
            />

            {/* Game selector */}
            <GameSelector
                games={games}
                selectedGames={selectedGames}
                onToggle={toggleGame}
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
