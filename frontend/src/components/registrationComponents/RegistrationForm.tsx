import { useState, useEffect } from "react";
import { Button, Form, Spinner } from "react-bootstrap";
import UsernameInput from "./UsernameInput";
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

    const [image, setImage] = useState<File | null>(null);
    const [birthDateUi, setBirthDateUi] = useState<string>("");
    const [gender, setGender] = useState("man");
    const [height, setHeight] = useState<number>(150);
    const [description, setDescription] = useState<string>("");

    const [ages, setAges] = useState<[number, number]>([18, 120]);
    const [preferredGendersArray, setPreferredGendersArray] = useState<string[]>(["man", "woman"]);
    const [location, setLocation] = useState("");
    const [age, setAge] = useState<number | null>(null);
    const [interest, setInterest] = useState<number[]>([3, 3, 3, 3, 3]); // stub values

    const [usernameValid, setUsernameValid] = useState(false);

    const isPasswordValid = /^(?=.*[A-Za-z])(?=.*\d).{6,}$/.test(password);
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const emailMatch = email.length > 0 && repeatedEmail === email;
    const passwordMatch = password.length > 0 && repeatedPassword === password;

    useEffect(() => {
        if (birthDateUi) {
            const birth = new Date(birthDateUi);
            const today = new Date();
            let userAge = today.getFullYear() - birth.getFullYear();
            const monthDiff = today.getMonth() - birth.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
                userAge--;
            }
            setAge(userAge);
        } else {
            setAge(null);
        }
    }, [birthDateUi]);

    const isFormValid = usernameValid &&
        isEmailValid &&
        emailMatch &&
        isPasswordValid &&
        passwordMatch &&
        birthDateUi &&
        age !== null &&
        age >= 18;

        // const fileToBase64 = (file: File): Promise<string> => {
        //     return new Promise((resolve, reject) => {
        //         const reader = new FileReader();
        //         reader.onload = () => {
        //             resolve(reader.result as string);
        //         };
        //         reader.onerror = reject;
        //         reader.readAsDataURL(file);
        //     });
        // };

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
        
            if (!ages) return;

            let base64Image: string | undefined = undefined;
            if (image) { // imageFile — состояние типа File
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
                    name: username,
                    profilePicture: base64Image, // 
                    birthDate: birthDateUi,
                    gender,
                    height,
                    description,
                    // location: location, // 
                },
                interestedMinAge: ages[0],
                interestedMaxAge: ages[1],
                interestedGenders: preferredGendersArray,
                interestVector: {
                    fantasy: interest[0],
                    competitive: interest[1],
                    action: interest[2],
                    story: interest[3],
                    complex: interest[4],
                },
            };
        
            onSubmit(userPayload);
        };        

    return (
        <Form onSubmit={handleSubmit}>
            <UsernameInput
                value={username}
                onChange={setUsername}
                onValidate={setUsernameValid}
                disabled={loading}
            />
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
            <Form.Group className="mb-3">
                <Form.Label>Date of Birth <span style={{ color: "red" }}>*</span></Form.Label>
                <Form.Control
                    type="date"
                    value={birthDateUi}
                    onChange={(e) => setBirthDateUi(e.target.value)}
                    required
                    disabled={loading}
                    min={new Date(new Date().setFullYear(new Date().getFullYear() - 120)).toISOString().split("T")[0]}
                    max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split("T")[0]}
                />
                {age !== null && age < 18 && (
                    <Form.Text className="text-danger">You must be at least 18 years old.</Form.Text>
                )}
            </Form.Group>

            <AgeRangeSelector userAge={age} onChange={setAges} />
            <GenderSelector onChange={setGender} selected={gender} />
            <HeightSet height={height} setHeight={setHeight} />
            <LocationSelector value={location} onChange={setLocation} disabled={loading} />
            <PreferredGenderSelector onChange={setPreferredGendersArray} selected={preferredGendersArray} />
            <Description description={description} setDescription={setDescription} />

            <ImageUpload image={image} setImage={setImage} loading={loading} />

            <Button
                variant="success"
                type="submit"
                disabled={loading || !isFormValid}
            >
                {loading ? <><Spinner animation="border" size="sm" /> Creating...</> : "Create Account"}
            </Button>
        </Form>
    );
};

export default RegisterForm;
