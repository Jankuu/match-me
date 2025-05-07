// Navigation for mobile versions on the bottom 
import { Container, Nav } from "react-bootstrap";
import {
    FaHome,
    FaUser,
    FaComments,
    FaBell,
    FaCog,
} from "react-icons/fa";
import "../styles/NavBar.css"; // стили отдельно

const NavBar = () => {
    return (
        <div className="nav-wrapper">
            <Container>
                <Nav className="justify-content-between nav-icons">
                    <Nav.Link href="/login">
                        <FaHome size={24} />
                    </Nav.Link>
                    <Nav.Link href="/my_profile">
                        <FaUser size={24} />
                    </Nav.Link>
                    <Nav.Link href="/chat">
                        <FaComments size={24} />
                    </Nav.Link>
                    <Nav.Link href="/matching">
                        <FaBell size={24} />
                    </Nav.Link>
                    <Nav.Link href="/settings">
                        <FaCog size={24} />
                    </Nav.Link>
                </Nav>
            </Container>
        </div>
    );
};

export default NavBar;
