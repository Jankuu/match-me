import { useLocation, useNavigate } from "react-router-dom";
import UserProfileComponent from "../components/UserProfileComponent";
import { UserProfile } from "../types/UserProfile";
import { useEffect } from "react";

const UserProfilePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const profile = location.state?.profile as UserProfile | undefined;

  useEffect(() => {
    if (!profile) {
      navigate("/matching"); // если профиль не передан, вернуться назад
    }
  }, [profile, navigate]);

  if (!profile) return <div>Loading...</div>;

  return <UserProfileComponent profile={profile} />;
};

export default UserProfilePage;
