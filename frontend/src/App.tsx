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
import { useState } from "react";
import SettingsPage from "./pages/SettingsPage";
import MatchingPage from "./pages/MatchingPage";
import UserProfilePage from "./pages/UserProfilePage";
import TestStenPage from "./pages/TestStenPage";

function App() {

    const [email, setEmail] = useState<string | null>(
        localStorage.getItem("email")
    )

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
                        element={<Navigate to={token ? "/matching" : "/login"} />}
                    />
                    <Route path="/login" element={<LoginPage onLoginSuccess={(email) => {
                        setEmail(email);
                        localStorage.setItem("email", email); // Saving it
                    }} />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/chat/:id/:username" element={<ChatPage />} />
                    <Route path="/user_profile/email/:email" element={<UserProfilePage />} />
                    <Route path="/user_profile/id/:id" element={<UserProfilePage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/matching" element={<MatchingPage />} />
                    <Route path="/test" element={<TestStenPage />} />
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
