import "./App.css";
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ChatPage from "./pages/ChatPage";
import MyProfilePage from "./pages/MyProfilePage";
import NavBar from "./Components/NavBar";
import { useMediaQuery } from "react-responsive";
import { useState, useEffect } from "react";
import SettingsPage from "./pages/SettingsPage";
import MatchingPage from "./pages/MatchingPage";
import UserProfilePage from "./pages/UserProfilePage";
import TestStenPage from "./pages/TestStenPage";
import JwtTestPage from "./pages/JwtTestPage";
import { getUserIdentifierFromToken } from "./utils/auth";

function App() {
    const [userIdentifier, setUserIdentifier] = useState<string>(() => getUserIdentifierFromToken() || "");

    useEffect(() => {
        // Initialize userIdentifier from JWT token if it exists
        const identifier = getUserIdentifierFromToken();
        if (identifier && !userIdentifier) {
            setUserIdentifier(identifier);
        }
    }, []);

    // DEBUGGING AND TEMPLATES:
    // const { client, isConnected } = useWebSocket();

    // useEffect(() => {
    //     if (!client || !isConnected) return;

    //     const subscription = client.subscribe(
    //         "/topic/my-custom-topic",
    //         (msg) => {
    //             console.log("📥 Received:", msg.body);
    //         }
    //     );

    //     return () => subscription.unsubscribe();
    // }, [client, isConnected]);

    // const [text, setText] = useState("");


    // const getAllUsersInDB = async () => {
    //     const res = await fetch("http://localhost:8080/users/users");
    //     const data = await res.json();
    //     console.log("Got all users: ");
    //     console.log(data);
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
                    <Route path="/login" element={<LoginPage onLoginSuccess={(identifier) => {
                        setUserIdentifier(identifier);
                    }} />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/chat" element={token ? <ChatPage /> : <Navigate to="/login" />} />
                    <Route path="/my_profile" element={token ? <MyProfilePage userIdentifier={userIdentifier || ""}/> : <Navigate to="/login" />} />
                    <Route path="/user_profile/:identifier" element={token ? <UserProfilePage /> : <Navigate to="/login" />} />
                    <Route path="/settings" element={token ? <SettingsPage /> : <Navigate to="/login" />} />
                    <Route path="/matching" element={token ? <MatchingPage /> : <Navigate to="/login" />} />
                    <Route path="/test" element={token ? <TestStenPage /> : <Navigate to="/login" />} />
                    <Route path="/jwt-test" element={<JwtTestPage />} />
                </Routes>
            </div>
            {token && <NavBar />}
        </Router>
    );
}

export default App;

// {(token && window.location.pathname !== "/login" && window.location.pathname !== "/register") && (
//     <NavBar />
// )}
