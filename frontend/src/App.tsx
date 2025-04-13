import "./App.css";
import { useEffect, useState } from "react";

import { useWebSocket } from "./WebSocketContext";
import { Client } from "@stomp/stompjs";
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ChatPage from "./pages/ChatPage";
import ProfilePage from "./pages/ProfilePage";
import NavBar from "./components/NavBar";
import { useMediaQuery } from "react-responsive";

function App() {
    // DEBUGGING AND TEMPLATES:
    const { client, isConnected } = useWebSocket();

    useEffect(() => {
        if (!client || !isConnected) return;

        const subscription = client.subscribe(
            "/topic/my-custom-topic",
            (msg) => {
                console.log("📥 Received:", msg.body);
            }
        );

        return () => subscription.unsubscribe();
    }, [client, isConnected]);

    const [text, setText] = useState("");

    const handleSend = () => {
        if (client && isConnected) {
            client.publish({ destination: "/app/send", body: text });
            console.log("📤 Sent to server:", text);
        } else {
            console.warn("WebSocket not connected");
        }
        setText("");
    };

    const getAllUsersInDB = async () => {
        const res = await fetch("http://localhost:8080/users/users");
        const data = await res.json();
        console.log("Got all users: ");
        console.log(data);
    };
    // DEBUGGING END

    // ше get it with first login
    const token = localStorage.getItem("token");
    const isMobile = useMediaQuery({ maxWidth: 768 });

    const paddingStyle = {
        paddingTop: isMobile ? "0" : "60px",
        paddingBottom: isMobile ? "60px" : "0",
    };

    return (
        <Router>
            <div style={paddingStyle}>
                <Routes>
                    {/* Default route — redirect based on login status, chat is used as an example */}
                    <Route
                        path="/"
                        element={<Navigate to={token ? "/chat" : "/login"} />}
                    />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/chat" element={<ChatPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                </Routes>
            </div>
            <NavBar />
        </Router>
    );
}

export default App;

// {(token && window.location.pathname !== "/login" && window.location.pathname !== "/register") && (
//     <NavBar />
// )}
