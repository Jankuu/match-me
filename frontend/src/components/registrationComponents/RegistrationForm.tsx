import { useState, useEffect } from "react";
import { Button, Form, Spinner } from "react-bootstrap";
import UsernameInput from "./UsernameInput";
import EmailInput from "./EmailInput";
import PasswordInput from "./PasswordInput";
import AgeRangeSelector from "./AgeRangeSelector";
import PreferredGenderSelector from "./PreferredGenderSelector";
import ImageUpload from "./ImageUpload";
import LocationSelector from "./LocationSelector";

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
    const [birthDate, setBirthDate] = useState<string>("");
    const [preferredGender, setPreferredGender] = useState<string>("any");
    const [location, setLocation] = useState("");
    const [age, setAge] = useState<number | null>(null);
    const [ages, setAges] = useState<[number, number] | null>(null);

    const [usernameValid, setUsernameValid] = useState(false);
    const isPasswordValid = /^(?=.*[A-Za-z])(?=.*\d).{6,}$/.test(password);
    


    useEffect(() => {
        if (birthDate) {
            const birth = new Date(birthDate);
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
    }, [birthDate]);

    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const emailMatch = email.length > 0 && repeatedEmail === email;
    const passwordMatch = password.length > 0 && repeatedPassword === password;

    const isFormValid = usernameValid &&
                    isEmailValid &&
                    emailMatch &&
                    isPasswordValid &&
                    passwordMatch &&
                    birthDate &&
                    age !== null &&
                    age >= 18;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const userPayload = {
            name: username,
            email,
            password,
            birthDate,
            preferredGender,
            location
        };

        const formData = new FormData();
        formData.append("user", new Blob([JSON.stringify(userPayload)], { type: "application/json" }));
        if (image) formData.append("image", image);

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
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
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
            <LocationSelector
                value={location}
                onChange={setLocation}
                disabled={loading}
            />
            <ImageUpload image={image} setImage={setImage} loading={loading} />
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
