// App.tsx

// Import global CSS styles for the entire application.
import "./App.css";
import {
    BrowserRouter as Router, // Main router component that keeps UI in sync with URL
    Routes, // Component for grouping and managing route definitions
    Route, // Component for defining a single route
    Navigate, // Component for declarative navigation (redirects)
    useNavigate, // Hook for imperative navigation (e.g., in a function)
    useLocation, // Hook to get the current URL's location object
} from "react-router-dom"; // React Router library for navigation
import LoginPage from "./pages/LoginPage"; // Login page component
import RegisterPage from "./pages/RegisterPage"; // Registration page component
import ChatPage from "./pages/ChatPage"; // Chat page component
import NavBar from "./components/NavBar"; // Navigation bar component
import { useMediaQuery } from "react-responsive"; // Hook for responsive design based on media queries
import { useState, useEffect } from "react"; // React hooks for state and side effects
import SettingsPage from "./pages/SettingsPage"; // Settings page component
import MatchingPage from "./pages/MatchingPage"; // User matching page component
import MyProfilePage from "./pages/MyProfilePage"; // User's own profile page component
import JwtTestPage from "./pages/JwtTestPage"; // Test page for JWT (JSON Web Token) functionality
import TestChat from "./pages/TestChat"; // A test chat component ( for development/debugging)
import { getUserIdentifierFromToken } from "./utils/auth"; // Utility function to extract user ID from JWT
import UserProfilePage from "./pages/UserProfilePage"; // Public user profile page component

/**
 * AppWrapper component.
 * This component's sole purpose is to wrap the main App component with `BrowserRouter`.
 * Hooks like `useNavigate` and `useLocation` must be used within a Router context,
 * so App is placed inside AppWrapper.
 */
function AppWrapper() {
    return (
        <Router>
            <App />
        </Router>
    );
}

/**
 * Main App component.
 * This component handles application-wide logic such as routing,
 * authentication state, and responsive layout adjustments.
 */
function App() {
    // Hook to programmatically navigate between routes.
    const navigate = useNavigate();
    // Hook to get information about the current URL location.
    const location = useLocation();

    // State to store the user's identifier (e.g., user ID or username) extracted from the JWT.
    // It initializes by trying to get the identifier from the token in local storage.
    const [userIdentifier, setUserIdentifier] = useState<string>(
        () => getUserIdentifierFromToken() || ""
    );
    // State to store the JWT token itself.
    // It initializes by retrieving the token from local storage.
    const [token, setToken] = useState<string | null>(
        () => localStorage.getItem("token")
    );

    // Determines if the current screen width is mobile (less than or equal to 768px).
    const isMobile = useMediaQuery({ maxWidth: 768 });
    // Determines if the NavBar should be hidden based on the current route.
    const hideNavBar = ["/login", "/register"].includes(location.pathname);

    // Effect to update userIdentifier if a token exists and userIdentifier isn't set.
    // This runs once on mount.
    useEffect(() => {
        const identifier = getUserIdentifierFromToken();
        if (identifier && !userIdentifier) {
            setUserIdentifier(identifier);
        }
    }, []); // Empty dependency array means this runs only once on mount

    // Effect to update the token state if the token in localStorage changes.
    // This also runs once on mount. If the token changes dynamically elsewhere,
    // this would need a more robust listener.
    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        setToken(storedToken);
    }, []); // Empty dependency array means this runs only once on mount

    // CSS style object for the main content container.
    // Adjusts padding based on whether the view is mobile or desktop
    // to account for the fixed NavBar (top on desktop, bottom on mobile).
    const layoutStyle: React.CSSProperties = {
        paddingTop: isMobile ? 0 : 68, // Add padding to avoid content being hidden by top NavBar on desktop
        paddingBottom: isMobile ? 75 : 0, // Add padding to avoid content being hidden by bottom NavBar on mobile
        minHeight: "100vh", // Ensure the container takes at least full viewport height
        boxSizing: "border-box", // Include padding and border in the element's total width and height
        display: "flex", // Make it a flex container
        flexDirection: "column", // Stack items vertically
        flexGrow: 1, // Allow it to grow and fill available space
        overflowY: "auto", // Allow this container to scroll if its content overflows
    };


    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', overflow: 'hidden' }}>
                {/* Conditionally render the NavBar:
                    - Only if a token exists (user is logged in)
                    - And if the current path is NOT login or register page
                */}
                {token && !hideNavBar && <NavBar />}

                {/* Main content area, where routes are rendered. */}
                <div className="content-container" style={layoutStyle}>
                    {/* Routes component manages which component to render based on the URL */}
                    <Routes>
                        {/* Root path: Redirects to /matching if logged in, otherwise to /login */}
                        <Route
                            path="/"
                            element={
                                token ? <Navigate to="/matching" /> : <Navigate to="/login" />
                            }
                        />
                        {/* Login Page Route */}
                        <Route
                            path="/login"
                            element={
                                <LoginPage
                                    // Callback function executed on successful login.
                                    // Updates userIdentifier and token states, then navigates to /matching.
                                    onLoginSuccess={(identifier) => {
                                        setUserIdentifier(identifier);
                                        setToken(localStorage.getItem("token")); // Re-fetch token after successful login
                                        navigate("/matching");
                                    }}
                                />
                            }
                        />
                        {/* Register Page Route */}
                        <Route path="/register" element={<RegisterPage />} />
                        {/* Chat Page Route: Requires authentication.
                            Uses URL parameters for chat ID and name (e.g., /chat/123/JohnDoe)
                        */}
                        <Route
                            path="/chat/:id/:name"
                            element={token ? <ChatPage /> : <Navigate to="/login" />}
                        />
                        {/* My Profile Page Route: Requires authentication. */}
                        <Route
                        path="/myprofile"
                        element={token ? <MyProfilePage /> : <Navigate to="/login" />}
                        />
                        {/* User Profile Page Route (for viewing other users' profiles): Requires authentication.
                            Uses URL parameter for user ID (e.g., /user_profile/id/456)
                        */}
                        <Route
                            path="/user_profile/id/:id"
                            element={token ? <UserProfilePage /> : <Navigate to="/login" />}
                        />
                        {/* Settings Page Route: Requires authentication. */}
                        <Route
                            path="/settings"
                            element={
                                token ? (
                                    <SettingsPage
                                        // Callback function executed on logout.
                                        // Clears token and user data from localStorage, resets states, and navigates to /login.
                                        onLogout={() => {
                                            localStorage.removeItem("token");
                                            localStorage.removeItem("user"); // Assuming 'user' is also stored
                                            setToken(null);
                                            setUserIdentifier("");
                                            navigate("/login");
                                        }}
                                    />
                                ) : (
                                    <Navigate to="/login" /> // Redirect if not authenticated
                                )
                            }
                        />
                        {/* Matching Page Route: Requires authentication. */}
                        <Route
                            path="/matching"
                            element={token ? <MatchingPage /> : <Navigate to="/login" />}
                        />
                        {/* JWT Test Page Route (development/testing JWT functionality) */}
                        <Route path="/jwt-test" element={<JwtTestPage />} />
                        {/* Test Chat Page Route (development/debugging chat) */}
                        <Route path="/testchat" element={<TestChat />} />
                    </Routes>
                </div>
            </div>
    );
}

// Export AppWrapper as the default export, ensuring Router context is available.
export default AppWrapper;