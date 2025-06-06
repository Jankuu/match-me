import { Container, Nav, Badge } from "react-bootstrap"; // Import Badge
import {
    FaUser,
    FaCog,
} from "react-icons/fa";
import { BsPeopleFill } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import { useWebSocket } from "../context/WebSocketContext"; // Import useWebSocket
import "../styles/NavBar.css";
import "../styles/ColorPallette.css";

const NavBar = () => {
    const navigate = useNavigate();
    const { hasUnreadConnections, hasUnreadConnectionRequests, markAllNotificationsAsRead } = useWebSocket(); // Use the hook

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
        markAllNotificationsAsRead(); // Mark all notifications as read when navigating to Matching page
        navigate("/matching");
    };

    // Determine if any new notifications exist for the overall People icon
    const hasAnyNewNotifications = hasUnreadConnections || hasUnreadConnectionRequests;

    return (
        <div className="nav-wrapper">
            <Container>
                <Nav className="justify-content-between nav-icons">
                    <Nav.Link as="button" onClick={handleProfileClick}>
                        <FaUser size={30} />
                    </Nav.Link>
                    <Nav.Link as="button" onClick={handleMatchingClick} className="position-relative"> {/* Added position-relative */}
                        <BsPeopleFill size={30} />
                        {hasAnyNewNotifications && ( // Conditional rendering of the badge
                            <Badge
                                bg="danger"
                                pill
                                className="position-absolute top-0 start-100 translate-middle"
                                style={{ fontSize: '0.6em', padding: '0.3em 0.5em' }} // Adjust size
                            >
                                {/* Optional: You can put a count here if you want */}
                            </Badge>
                        )}
                    </Nav.Link>
                    <Nav.Link href="/settings">
                        <FaCog size={30} />
                    </Nav.Link>
                </Nav>
            </Container>
        </div>
    );
};

export default NavBar;