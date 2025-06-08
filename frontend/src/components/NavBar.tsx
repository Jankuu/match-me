import { Container, Nav } from "react-bootstrap";
import {
    FaUser,
    FaCog,
} from "react-icons/fa";
import { BsPeopleFill } from "react-icons/bs";
import { useNavigate, useLocation } from "react-router-dom"; // Import useLocation
import { useWebSocket } from "../context/WebSocketContext";
import "../styles/NavBar.css";
import "../styles/ColorPallette.css"; // Assuming --danger-color is defined here

const NavBar = () => {
    const navigate = useNavigate();
    const location = useLocation(); // Initialize useLocation hook

    const { hasUnreadConnectionRequests, hasUnreadConnections, hasUnreadMessages } = useWebSocket();

    const handleProfileClick = () => {
        const userStr = localStorage.getItem("user");

        if (!userStr) {
            navigate("/login");
            return;
        }

        try {
            const user = JSON.parse(userStr);
            const username = user.username;

            if (!username) {
                navigate("/login");
                return;
            }

            navigate(`/myprofile`);
        } catch (e) {
            console.error("Invalid user data in localStorage", e);
            navigate("/login");
        }
    };

    const handleMatchingClick = () => {
        navigate("/matching");
    };

    const hasAnyUnreadNotifications = hasUnreadConnectionRequests || hasUnreadConnections || hasUnreadMessages;

    // Determine if the current path matches the icon's associated route
    const isProfileActive = location.pathname === '/myprofile';
    const isMatchingActive = location.pathname === '/matching'|| location.pathname.startsWith('/chat');
    const isSettingsActive = location.pathname === '/settings';

    // Define base size and active size
    const baseIconSize = 30;
    const activeIconSize = 50;

    return (
        <div className="nav-wrapper">
            <Container>
                <Nav className="justify-content-between align-items-center nav-icons">
                    <Nav.Link as="button" onClick={handleProfileClick}>
                        <FaUser
                            size={isProfileActive ? activeIconSize : baseIconSize}
                        />
                    </Nav.Link>
                    <Nav.Link as="button" onClick={handleMatchingClick}>
                        <BsPeopleFill
                            size={isMatchingActive ? activeIconSize : baseIconSize}
                            // Combine notification color with active state color if needed,
                            // or keep it simple as you have now based on notifications only.
                            color={hasAnyUnreadNotifications ? '#B4654A' : 'currentColor'}
                        />
                    </Nav.Link>
                    <Nav.Link href="/settings">
                        <FaCog
                            size={isSettingsActive ? activeIconSize : baseIconSize}
                        />
                    </Nav.Link>
                </Nav>
            </Container>
        </div>
    );
};

export default NavBar;