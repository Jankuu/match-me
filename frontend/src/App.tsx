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
import NavBar from "./components/NavBar";
import { useMediaQuery } from "react-responsive";
import { useState } from "react";
import SettingsPage from "./pages/SettingsPage";
import MatchingPage from "./pages/MatchingPage";
import UserProfilePage from "./pages/UserProfilePage";

function App() {
   
    const [email, setEmail] = useState<string | null>(
        localStorage.getItem("email")
    );
    
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
                    <Route path="/login" element={<LoginPage onLoginSuccess={(email) => {
                        setEmail(email);
                        localStorage.setItem("email", email); // Сохраняем между перезагрузками
                    }} />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/chat" element={<ChatPage />} />
                    <Route path="/my_profile" element={<MyProfilePage email={email || ""}/>} />
                    <Route path="/user_profile/:email" element={<UserProfilePage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/matching" element={<MatchingPage />} />
                </Routes>
            </div>
            <NavBar />
        </Router>
    );
}

export default App;