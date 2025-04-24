import { Form } from "react-bootstrap";

type Props = {
    value: string;
    onChange: (value: string) => void;
    disabled: boolean;
};

const estonianCities = [
    "Tallinn",
    "Tartu",
    "Narva",
    "Pärnu",
    "Kohtla-Järve",
    "Viljandi",
    "Rakvere",
    "Maardu",
    "Sillamäe",
    "Kuressaare",
    "Võru",
    "Valga",
    "Haapsalu",
    "Jõhvi",
    "Paide"
];

const LocationSelector = ({ value, onChange, disabled }: Props) => {
    return (
        <Form.Group className="mb-3">
            <Form.Label>Location <span style={{ color: "red" }}>*</span></Form.Label>
            <Form.Select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                required
            >
                <option value="">Select your city</option>
                {estonianCities.map((city) => (
                    <option key={city} value={city}>
                        {city}
                    </option>
                ))}
            </Form.Select>
        </Form.Group>
    );
};

export default LocationSelector;
