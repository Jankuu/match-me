// src/pages/SettingsPage.tsx

import React from "react";
import { Container, Button, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
// Импортируем useWebSocket из вашего контекста
import { useWebSocket } from '../providers/WebSocketProvider'; // <-- НОВОЕ: Импорт контекста

interface SettingsPageProps {
    onLogout: () => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ onLogout }) => {
    const navigate = useNavigate();
    // НОВОЕ: Получаем refreshAuthData из контекста WebSocket
    const { refreshAuthData } = useWebSocket();

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        // ОЧЕНЬ ВАЖНО: Сообщаем WebSocketProvider, что данные аутентификации обновились (токен удален).
        // Это приведет к деактивации WebSocket-соединения.
        refreshAuthData(); // <-- ВЫЗЫВАЕМ ЭТУ ФУНКЦИЮ!

        onLogout(); // inform parent component (if it needs to update global auth state)
        navigate("/"); // Redirect to home or login page
    };

    return (
        <Container className="mt-5" style={{ maxWidth: "500px" }}>
            <Card>
                <Card.Body>
                    <Card.Title>Settings</Card.Title>
                    <hr />
                    <Button variant="danger" onClick={handleLogout}>
                        Logout
                    </Button>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default SettingsPage;