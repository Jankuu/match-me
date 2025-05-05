// Navigation for mobile versions on the bottom 
import { Container, Nav } from "react-bootstrap";
import {
    FaUser,
    FaCog,
} from "react-icons/fa";
import "../styles/NavBar.css"; // стили отдельно
import { BsPeopleFill } from "react-icons/bs";

const NavBar = () => {
    return (
        <div className="nav-wrapper">
            <Container>
                <Nav className="justify-content-between nav-icons">
                    {/* <Nav.Link href="/login">
                        <FaHome size={24} />
                    </Nav.Link> */}
                    <Nav.Link href="/my_profile">
                        <FaUser size={30} />
                    </Nav.Link>
                    {/* <Nav.Link href="/chat">
                        <FaPeopleGroup size={24} />
                    </Nav.Link> */}
                    <Nav.Link href="/matching">
                        <BsPeopleFill size={30} />
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
