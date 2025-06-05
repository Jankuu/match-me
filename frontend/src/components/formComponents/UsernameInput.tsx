import { useEffect } from "react";
import { Form, InputGroup } from "react-bootstrap";
import { CheckCircleFill, XCircleFill } from "react-bootstrap-icons";

type Props = {
    value: string;
    onChange: (value: string) => void;
    onValidate: (isValid: boolean) => void;
    disabled: boolean;
};

const UsernameInput = ({ value, onChange, onValidate, disabled }: Props) => {    

    const isLongEnough = value.trim().length > 0;
    const structureValid = true;
    const nameValid = isLongEnough && structureValid;

    useEffect(() => {
        onValidate(nameValid);
    }, [value, nameValid, onValidate]);

    return (
        <Form.Group className="mb-3">
            <Form.Label>
                Username 
                {/* <span style={{ color: "red" }}>*</span> */}
            </Form.Label>
            <InputGroup>
                <Form.Control
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="Enter your username"
                    // required
                    disabled={disabled}
                    isInvalid={value.length < 1}
                />
                <InputGroup.Text>
                    {value && (
                        nameValid ? (
                            <CheckCircleFill color="green" />
                        ) : (
                            <XCircleFill color="red" />
                        )
                    )}
                </InputGroup.Text>
            </InputGroup>

            {/* Show length hint if too short */}
            {value.length < 1 && (
                <Form.Text className="text-danger d-block">
                    Username must be more than 1 character long.
                </Form.Text>
            )}
        </Form.Group>
    );
};

export default UsernameInput;
