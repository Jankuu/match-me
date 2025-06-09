import { useState, useEffect } from "react";
import { Button, Form, Container, Spinner, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { getUserIdentifierFromToken, isAuthenticated } from "../utils/auth";
import "../styles/ColorPallette.css";
// Импортируйте useWebSocket из вашего контекста
import { useWebSocket } from '../providers/WebSocketProvider'; // <-- НОВОЕ: Импорт контекста

interface User {
    id: number;
    username: string;
    email: string;
    profile: {
        name: string | null;
        birthDate: string | null;
        gender: string | null;
        height: number | null;
        description: string | null;
        profilePicture: string | null;
    };
    interestedMinAge: number | null;
    interestedMaxAge: number | null;
    interestedGenders: string[] | null;
    interestedGames: any[] | null;
    radius: number | null;
}

type LoginPageProps = {
    onLoginSuccess: (identifier: string) => void;
};

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
    // const [token, setToken] = useState<string | null>(null); // Это состояние здесь не нужно, т.к. токен хранится в localStorage
    const [usernameOrEmail, setUsernameOrEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // НОВОЕ: Получаем refreshAuthData из контекста WebSocket
    const { refreshAuthData } = useWebSocket();

    useEffect(() => {
        // If user is already authenticated, redirect to matching page
        if (isAuthenticated()) {
            navigate("/matching");
            // Если пользователь уже аутентифицирован при первом заходе на страницу логина,
            // убедимся, что WebSocket также "в курсе" (особенно после обновления страницы).
            refreshAuthData(); // <-- Дополнительный вызов здесь
        }
    }, [navigate, refreshAuthData]); // Добавьте refreshAuthData в зависимости

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await fetch("http://localhost:8080/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    usernameOrEmail,
                    password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Login failed");
            }

            const receivedToken: string = data.token;
            localStorage.setItem("token", receivedToken);
            // setToken(receivedToken); // Это состояние здесь не нужно

            const user: User = data.user;
            const processedUser: User = {
                ...user,
                profile: {
                    name: user.profile?.name || '',
                    birthDate: user.profile?.birthDate || '',
                    gender: user.profile?.gender || 'man',
                    height: user.profile?.height || 170,
                    description: user.profile?.description || '',
                    profilePicture: user.profile?.profilePicture || '',
                },
                interestedMinAge: user.interestedMinAge || 18,
                interestedMaxAge: user.interestedMaxAge || 99,
                interestedGenders: user.interestedGenders || [],
                interestedGames: user.interestedGames || [],
                radius: user.radius || 5000,
            };

            localStorage.setItem("user", JSON.stringify(processedUser));

            // НОВОЕ И ВАЖНОЕ: Сообщаем WebSocketProvider, что данные аутентификации обновились
            refreshAuthData(); // <-- ВЫЗЫВАЕМ ЭТУ ФУНКЦИЮ!

            const identifier = getUserIdentifierFromToken();
            if (identifier) {
                onLoginSuccess(identifier);
            } else {
                // В случае, если getUserIdentifierFromToken не сработал по какой-то причине,
                // но data.user.identifier есть, используем его
                onLoginSuccess(data.user.identifier);
            }

            setUsernameOrEmail("");
            setPassword("");

        } catch (err: any) {
            setError("Invalid username/email or password");
            console.error("Login error:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="mt-5" style={{ maxWidth: "400px" }}>
            <h2 className="mb-4">Login</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form onSubmit={handleLogin}>
                <Form.Group className="mb-3">
                    <Form.Label>Email or Username</Form.Label>
                    <Form.Control
                        type="text"
                        value={usernameOrEmail}
                        onChange={(e) => setUsernameOrEmail(e.target.value)}
                        required
                        disabled={loading}
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={loading}
                    />
                </Form.Group>
                <Button variant="primary" type="submit" disabled={loading}>
                    {loading ? (<><Spinner animation="border" size="sm" /> Logging in...</>) : "Login"}
                </Button>
                <Button
                    variant="link"
                    onClick={() => navigate("/register")}
                    className="ms-2"
                    disabled={loading}
                >
                    Sign up
                </Button>
            </Form>
            <div className="mt-4 text-center">
                <small className="text-muted">For developers:</small>
                <br />
                <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => navigate("/jwt-test")}
                    className="mt-1"
                >
                    JWT Authentication Test Page
                </Button>
            </div>
        </Container>
    );
};

export default LoginPage;