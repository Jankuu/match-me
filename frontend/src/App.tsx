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
import NavBar from "./components/NavBar";
import { useMediaQuery } from "react-responsive";
import { useState, useEffect } from "react";
import SettingsPage from "./pages/SettingsPage";
import MatchingPage from "./pages/MatchingPage";
import UserProfilePage from "./pages/UserProfilePage";
import JwtTestPage from "./pages/JwtTestPage";
import { getUserIdentifierFromToken } from "./utils/auth";

function App() {
    const [userIdentifier, setUserIdentifier] = useState<string>(
        () => getUserIdentifierFromToken() || ""
    );

    useEffect(() => {
        // Initialize userIdentifier from JWT token if it exists
        const identifier = getUserIdentifierFromToken();
        if (identifier && !userIdentifier) {
            setUserIdentifier(identifier);
        }
    }, []);

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
                    <Route
                        path="/login"
                        element={
                            <LoginPage
                                onLoginSuccess={(identifier) => {
                                    setUserIdentifier(identifier);
                                }}
                            />
                        }
                    />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route
                        path="/chat"
                        element={
                            token ? <ChatPage /> : <Navigate to="/login" />
                        }
                    />
                    <Route
                        path="/user_profile/username/:identifier"
                        element={
                            token ? (
                                <UserProfilePage />
                            ) : (
                                <Navigate to="/login" />
                            )
                        }
                    />
                    <Route
                        path="/user_profile/id/:identifier"
                        element={
                            token ? (
                                <UserProfilePage />
                            ) : (
                                <Navigate to="/login" />
                            )
                        }
                    />
                    <Route
                        path="/settings"
                        element={
                            token ? <SettingsPage /> : <Navigate to="/login" />
                        }
                    />
                    <Route
                        path="/matching"
                        element={
                            token ? <MatchingPage /> : <Navigate to="/login" />
                        }
                    />
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
