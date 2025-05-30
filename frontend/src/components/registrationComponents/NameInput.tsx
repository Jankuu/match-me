import { useEffect } from "react";
import { Form, InputGroup } from "react-bootstrap";
import { CheckCircleFill, XCircleFill } from "react-bootstrap-icons";

type Props = {
    value: string;
    onChange: (value: string) => void;
    onValidate: (isValid: boolean) => void;
    disabled: boolean;
};

const NameInput = ({ value, onChange, onValidate, disabled }: Props) => {
    // Valid username: each word starts with capital letter, letters only
    const isStructureValid = (name: string) => {
        const parts = name.trim().split(/[- ]/);
        return parts.every((part) => /^[A-Z][a-z]*$/.test(part));
    };

    const isLongEnough = value.trim().length > 1;
    const structureValid = isStructureValid(value);
    const isUsernameValid = isLongEnough && structureValid;

    // Report validity to parent (only when value changes)
    useEffect(() => {
        onValidate(isUsernameValid);
    }, [value, isUsernameValid, onValidate]);

    return (
        <Form.Group className="mb-3">
            <Form.Label>
                Name 
                {!disabled && (<span style={{ color: "red" }}>*</span>)}
            </Form.Label>
            <InputGroup>
                <Form.Control
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="Enter your name"
                    required
                    disabled={disabled}
                    isInvalid={value.length > 0 && !isUsernameValid}
                />
                {!disabled && (<InputGroup.Text>
                    {value && (
                        isUsernameValid ? (
                            <CheckCircleFill color="green" />
                        ) : (
                            <XCircleFill color="red" />
                        )
                    )}
                </InputGroup.Text>)}
            </InputGroup>

            {/* Show structure hint if structure invalid */}
            {value.length > 0 && !structureValid && (
                <Form.Text className="text-danger d-block">
                    Name must start with a capital letter and can contain only letters, spaces or hyphens.
                </Form.Text>
            )}

            {/* Show length hint if too short */}
            {value.length > 0 && !isLongEnough && (
                <Form.Text className="text-danger d-block">
                    Name must be more than 1 characters long.
                </Form.Text>
            )}
        </Form.Group>
    );
};

export default NameInput;
