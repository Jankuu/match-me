// src/pages/SettingsPage.tsx

import React from "react";
import { Container, Button, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useWebSocket } from '../providers/WebSocketProvider';

interface SettingsPageProps {
    onLogout: () => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ onLogout }) => {
    const navigate = useNavigate();
    // Destructure refreshAuthData AND markAllNotificationsAsRead from the WebSocket context
    const { refreshAuthData, markAllNotificationsAsRead } = useWebSocket(); // <-- UPDATED: Added markAllNotificationsAsRead

    const handleLogout = () => {
        // Clear authentication tokens and user data from local storage
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("unreadMessages"); // It's a good idea to clear this too on logout

        // 1. Inform WebSocketProvider that auth data has changed (token removed).
        // This will lead to the deactivation of the WebSocket connection.
        refreshAuthData();

        // 2. Clear all unread notifications within the application's state.
        // This ensures the notification badges are reset for a fresh start.
        markAllNotificationsAsRead(); // <-- NEW: Call this function to clear all notifications

        // 3. Inform parent component about logout (if needed for global state updates)
        onLogout();

        // 4. Redirect to the home or login page
        navigate("/");
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