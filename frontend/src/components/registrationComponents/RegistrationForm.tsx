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

type Props = {
    onSubmit: (data: FormData) => void;
    loading: boolean;
};

const RegisterForm = ({ onSubmit, loading }: Props) => {
    const [email, setEmail] = useState("");
    const [repeatedEmail, setRepeatedEmail] = useState("");
    const [password, setPassword] = useState("");
    const [repeatedPassword, setRepeatedPassword] = useState("");
    const [username, setUsername] = useState("");
    const [image, setImage] = useState<File | null>(null);
    const [gender, setGender] = useState("");
    const [birthDateUi, setBirthDateUi] = useState<string>("");
    const [height, setHeight] = useState<number>(150);
    const [preferredGendersArray, setPreferredGender] = useState<string[]>(["man", "woman"]);
    const [location, setLocation] = useState("");
    const [age, setAge] = useState<number | null>(null);
    const [ages, setAges] = useState<[number, number]>([18, 120]);
    const [description, setDescription] = useState<string>("");


    const [usernameValid, setUsernameValid] = useState(false);
    const isPasswordValid = /^(?=.*[A-Za-z])(?=.*\d).{6,}$/.test(password);
    


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

    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const emailMatch = email.length > 0 && repeatedEmail === email;
    const passwordMatch = password.length > 0 && repeatedPassword === password;

    const isFormValid = usernameValid &&
        isEmailValid &&
        emailMatch &&
        isPasswordValid &&
        passwordMatch &&
        birthDateUi &&
        age !== null &&
        age >= 18;

        const handleSubmit = (e: React.FormEvent) => {
            e.preventDefault();
        
            if (!ages) return; // protection
        
            // Need to be organized according to the backend
            interface Interest {
                fantasy: number;
                competitive: number;
                action: number;
                story: number;
                complex: number;
            }
            
            interface Profile {
                name: string;
                profilePicture: number[]; // массив чисел
                birthDate: string; // в формате '1993-02-01'
                gender: string;
                height: number;
                description: string;
            }
            
            interface UserPayload {
                username: string;
                email: string;
                password: string;
                profile: Profile;
                interestedMinAge: number;
                interestedMaxAge: number;
                interestedGenders: string[];
                interest: Interest;
            }

            const userPayload: UserPayload = {
                username,
                email,
                password,
                profile: {
                    name: username,
                    profilePicture: [1], // например, [1]
                    birthDate: birthDateUi, // обязательно в формате "1993-02-01"
                    gender,
                    height,
                    description,
                },
                interestedMinAge: ages[0],
                interestedMaxAge: ages[1],
                interestedGenders: preferredGendersArray, // например ["man"]
                interest: {
                    fantasy,
                    competitive,
                    action,
                    story,
                    complex,
                },
            };
        
            const formData = new FormData();
            formData.append(
                "user",
                new Blob([JSON.stringify(userPayload)], { type: "application/json" })
            );
        
            if (image) {
                formData.append("image", image);
            }
        
            onSubmit(formData);
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
            <AgeRangeSelector 
                userAge={age}
                onChange={setAges}
            />
            <GenderSelector 
                onChange={setGender} 
                selected={gender}            
            />
            <HeightSet 
                height={height} 
                setHeight={setHeight}          
            />
            <LocationSelector
                value={location}
                onChange={setLocation}
                disabled={loading}
            />
            <PreferredGenderSelector 
                onChange={setPreferredGender} 
                selected={preferredGendersArray}            
            />
            <Description 
                description={description} 
                setDescription={setDescription} 
            />

            <ImageUpload image={null} setImage={function (file: File | null): void {
                throw new Error("Function not implemented.");
            } } loading={false} 
            />

            <Button
                variant="success"
                type="submit"
                disabled={
                    loading || !isFormValid
                }
            >
                {loading ? <><Spinner animation="border" size="sm" /> Creating...</> : "Create Account"}
            </Button>
        </Form>
    );
};

export default RegisterForm;
