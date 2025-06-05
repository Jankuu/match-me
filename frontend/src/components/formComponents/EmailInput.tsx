import { Form, InputGroup } from "react-bootstrap";
import { CheckCircleFill, XCircleFill } from "react-bootstrap-icons";

type Props = {
    email: string;
    repeatedEmail: string;
    setEmail: (value: string) => void;
    setRepeatedEmail: (value: string) => void;
    loading: boolean;
};

const EmailInput = ({ email, repeatedEmail, setEmail, setRepeatedEmail, loading }: Props) => {
    // Email validation logic
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    
    return (
        <>
            <Form.Group className="mb-3">
                    <Form.Label>Email <span style={{ color: "red" }}>*</span></Form.Label>
                    <InputGroup>
                        <Form.Control
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            // required
                            disabled={loading}
                            isInvalid={email.length > 0 && !isEmailValid}
                        />
                        <InputGroup.Text>
                            {email ? ( 
                                isEmailValid ? (
                                    <CheckCircleFill color="green" />
                                ) : (
                                    <XCircleFill color="red" />
                                )
                            ) : null}
                        </InputGroup.Text>
                    </InputGroup>
                    {email.length > 0 && !isEmailValid && (
                        <Form.Text className="text-danger">
                            Email must be valid (e.g., user@example.com)
                        </Form.Text>
                    )}
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Repeat Email <span style={{ color: "red" }}>*</span></Form.Label>
                    <InputGroup>
                        <Form.Control
                            type="email"
                            value={repeatedEmail}
                            onChange={(e) => setRepeatedEmail(e.target.value)}
                            // required
                            disabled={loading || !isEmailValid}
                            isInvalid={repeatedEmail.length > 0 && repeatedEmail !== email}
                        />
                        <InputGroup.Text>
                            {repeatedEmail ? (
                                repeatedEmail === email ? (
                                    <CheckCircleFill color="green" />
                                ) : (
                                    <XCircleFill color="red" />
                                )
                            ) : null}
                        </InputGroup.Text>
                    </InputGroup>
                </Form.Group>
        </>
    );
};

export default EmailInput;
