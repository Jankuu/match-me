import { Form, InputGroup } from "react-bootstrap";
import { CheckCircleFill, XCircleFill } from "react-bootstrap-icons";

type Props = {
    password: string;
    repeatedPassword: string;
    setPassword: (value: string) => void;
    setRepeatedPassword: (value: string) => void;
    loading: boolean;
};

const PasswordInput = ({ password, repeatedPassword, setPassword, setRepeatedPassword, loading }: Props) => {

    const isPasswordValid = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/.test(password);

    return (
        <>
            <Form.Group className="mb-3">
                <Form.Label>Password <span style={{ color: "red" }}>*</span></Form.Label>
                <InputGroup>
                    <Form.Control
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password"
                        required
                        disabled={loading}
                        isInvalid={password.length > 0 && !isPasswordValid}
                    />
                    <InputGroup.Text>
                        {password ? ( 
                            isPasswordValid ? (
                                <CheckCircleFill color="green" />
                            ) : (
                                <XCircleFill color="red" />
                            )
                        ) : null}
                    </InputGroup.Text>
                </InputGroup>
                {password.length > 0 && password.length < 6 && (
                    <Form.Text className="text-danger d-block">
                        Password must be at least 6 characters long
                    </Form.Text>
                )}
                {password.length > 0 && !/[0-9]/.test(password) && (
                    <Form.Text className="text-danger d-block">
                        Password must contain at least one number
                    </Form.Text>
                )}
                {password.length > 0 && !/[A-Za-z]/.test(password) && (
                    <Form.Text className="text-danger d-block">
                        Password must contain at least one letter
                    </Form.Text>
                )}

            </Form.Group>


            <Form.Group className="mb-3">
                <Form.Label>Repeat Password <span style={{ color: "red" }}>*</span></Form.Label>
                <InputGroup>
                    <Form.Control
                        type="password"
                        value={repeatedPassword}
                        onChange={(e) => setRepeatedPassword(e.target.value)}
                        placeholder="Repeat password"
                        required
                        disabled={loading || !isPasswordValid}
                    />
                    <InputGroup.Text>
                        {password ? ( 
                            password === repeatedPassword ? (
                                <CheckCircleFill color="green" />
                            ) : (
                                <XCircleFill color="red" />
                            )
                        ) : null}
                    </InputGroup.Text>
                </InputGroup>
                {password && repeatedPassword && password !== repeatedPassword && (
                    <Form.Text className="text-danger">Passwords do not match.</Form.Text>
                )}
            </Form.Group>
        </>
    );
};

export default PasswordInput;
