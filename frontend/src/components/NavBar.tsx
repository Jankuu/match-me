import { Container, Nav } from "react-bootstrap";
import {
    FaUser,
    FaCog,
} from "react-icons/fa";
import { BsPeopleFill } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import "../styles/NavBar.css";
import "../styles/ColorPallette.css";

const NavBar = () => {
    const navigate = useNavigate();

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

            navigate(`/user_profile/username/${username}`);
        } catch (e) {
            console.error("Invalid user data in localStorage", e);
            navigate("/login");
        }
    };

    return (
        <div className="nav-wrapper">
            <Container>
                <Nav className="justify-content-between nav-icons">
                    <Nav.Link as="button" onClick={handleProfileClick}>
                        <FaUser  size={30} />
                    </Nav.Link>
                    <Nav.Link href="/matching">
                        <BsPeopleFill size={30} />
                    </Nav.Link>
                    <Nav.Link href="/settings">
                        <FaCog size={30} />
                    </Nav.Link>
                    {/*Make active c-cherry class  */}
                </Nav>
            </Container>
        </div>
    );
};

export default NavBar;
