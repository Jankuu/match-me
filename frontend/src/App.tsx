// App.tsx
import "./App.css";
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
    useNavigate,
    useLocation,
} from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ChatPage from "./pages/ChatPage";
import NavBar from "./components/NavBar";
import { useMediaQuery } from "react-responsive";
import { useState, useEffect } from "react";
import SettingsPage from "./pages/SettingsPage";
import MatchingPage from "./pages/MatchingPage";
import MyProfilePage from "./pages/MyProfilePage";
import JwtTestPage from "./pages/JwtTestPage";
import TestChat from "./pages/TestChat";
import { getUserIdentifierFromToken } from "./utils/auth";
import UserProfilePage from "./pages/UserProfielPage";

// Обёртка для использования хуков (navigate/location) внутри App
function AppWrapper() {
    return (
        <Router>
            <App />
        </Router>
    );
}

function App() {
    const navigate = useNavigate();
    const location = useLocation();

    const [userIdentifier, setUserIdentifier] = useState<string>(
        () => getUserIdentifierFromToken() || ""
    );
    const [token, setToken] = useState<string | null>(
        () => localStorage.getItem("token")
    );

    const isMobile = useMediaQuery({ maxWidth: 768 });
    const hideNavBar = ["/login", "/register"].includes(location.pathname);

    useEffect(() => {
        const identifier = getUserIdentifierFromToken();
        if (identifier && !userIdentifier) {
            setUserIdentifier(identifier);
        }
    }, []); 

    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        setToken(storedToken);
    }, []); 

    const layoutStyle: React.CSSProperties = {
        paddingTop: isMobile ? 0 : 68,
        paddingBottom: isMobile ? 60 : 0,
        minHeight: "100vh",
        boxSizing: "border-box", 
    };

    return (
        <>
            {token && !hideNavBar && <NavBar />}
            <div style={layoutStyle}>
                <Routes>
                    <Route
                        path="/"
                        element={
                            token ? <Navigate to="/matching" /> : <Navigate to="/login" />
                        }
                    />
                    <Route
                        path="/login"
                        element={
                            <LoginPage
                                onLoginSuccess={(identifier) => {
                                    setUserIdentifier(identifier);
                                    setToken(localStorage.getItem("token"));
                                    navigate("/matching");
                                }}
                            />
                        }
                    />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route
                        path="/chat/:id/:name"
                        element={token ? <ChatPage /> : <Navigate to="/login" />}
                    />
                    <Route
                    path="/myprofile"
                    element={token ? <MyProfilePage /> : <Navigate to="/login" />}
                    />
                    
                    {/* <Route
                        path="/user_profile/id/:identifier"
                        element={token ? <UserProfilePage /> : <Navigate to="/login" />}
                    /> */}
                    <Route
                        path="/settings"
                        element={
                            token ? (
                                <SettingsPage
                                    onLogout={() => {
                                        localStorage.removeItem("token");
                                        localStorage.removeItem("user");
                                        setToken(null);
                                        setUserIdentifier("");
                                        navigate("/login");
                                    }}
                                />
                            ) : (
                                <Navigate to="/login" />
                            )
                        }
                    />
                    <Route
                        path="/matching"
                        element={token ? <MatchingPage /> : <Navigate to="/login" />}
                    />
                    <Route path="/jwt-test" element={<JwtTestPage />} />
                    <Route path="/testchat" element={<TestChat />} />
                </Routes>
            </div>
            
        </>
    );
}

export default AppWrapper;
