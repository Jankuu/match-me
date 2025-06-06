// src/pages/UserProfilePage.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Container, Card } from 'react-bootstrap';
import { ArrowLeft } from 'react-bootstrap-icons';
import apiClient from '../utils/apiClient';
import { UserProfile } from '../types/UserProfile'; // Убедитесь, что это правильный путь к вашему типу UserProfile

// Тип UserProfile (обновленный и сделанный опциональным)
// Убедитесь, что этот тип также обновлен в вашем src/types/UserProfile.ts
// и используется единообразно по всему проекту.
// Если он уже экспортирован из src/types/UserProfile.ts, вам не нужно его здесь повторять.
// Если он был определен только в UserProfileCard.tsx, перенесите его в src/types/UserProfile.ts.
/*
export type UserProfile = {
  id: number;
  name?: string | null;
  profilePicture?: string | null;
  birthDate?: string | null;
  gender?: string | null;
  height?: number | null;
  description?: string | null;
};
*/

// Вспомогательная функция для расчета возраста
const calculateAge = (birthDate?: string | null): number | null => {
  if (!birthDate) return null;
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

const UserProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // Получаем ID из URL
  const location = useLocation();
  const navigate = useNavigate();

  // Пытаемся получить profile из state, переданного через navigate
  const profileFromState = location.state?.profile as UserProfile | undefined;

  const [currentProfile, setCurrentProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      if (profileFromState) {
        // Если профиль уже есть в state (т.е. пришли по клику с MatchingPage)
        setCurrentProfile(profileFromState);
        setIsLoading(false);
      } else if (id) {
        // Если профиля нет в state (например, обновили страницу или зашли по прямой ссылке),
        // загружаем его с сервера по ID
        try {
          setIsLoading(true);
          const res = await apiClient.get(`/users/${id}`); // Предполагаем, что у вас есть API для получения пользователя по ID
          setCurrentProfile(res.data);
          setError(null);
        } catch (err) {
          console.error("Failed to fetch user profile:", err);
          setError("Failed to load user profile. It might not exist or there was a network error.");
          // Опционально: можно перенаправить на 404 страницу или страницу со списком
          // navigate('/not-found');
        } finally {
          setIsLoading(false);
        }
      } else {
        // Если ID не предоставлен в URL
        setIsLoading(false);
        setError("User ID is missing in the URL.");
        navigate('/matching'); // Перенаправить на страницу соответствий
      }
    };

    loadProfile();
  }, [id, profileFromState, navigate]); // Добавляем navigate в зависимости

  // --- Логика рендеринга ---
  if (isLoading) {
    return <div className="text-center mt-5">Загрузка профиля...</div>;
  }

  if (error) {
    return <div className="alert alert-danger text-center mt-5">{error}</div>;
  }

  if (!currentProfile) {
    return <div className="text-center mt-5">Профиль пользователя не найден.</div>;
  }

  // Если профиль загружен, отображаем его детали (из бывших UserProfileComponent/UserProfileCard)
  const age = calculateAge(currentProfile.birthDate);

  return (
    <>
      <div className="px-3 pt-3">
        <button onClick={() => navigate("/matching")} className="btn btn-primary">
          <ArrowLeft size={20} className="me-1" />
          Back
        </button>
      </div>

      <Container className="mt-4" style={{ maxWidth: "600px" }}>
        <Card className="p-4 shadow">
          <div className="text-center mb-3 d-flex justify-content-center"> {/* Added d-flex and justify-content-center */}
            {currentProfile.profilePicture ? (
              <img
                src={
                  currentProfile.profilePicture.startsWith("data:image")
                    ? currentProfile.profilePicture
                    : `data:image/jpeg;base64,${currentProfile.profilePicture}`
                }
                alt="Profile"
                className="rounded-circle"
                style={{ width: "150px", height: "150px", objectFit: "cover" }}
              />
            ) : (
              <div
                className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center"
                style={{ width: "150px", height: "150px", fontSize: "24px" }}
              >
                {(currentProfile.name || 'U').charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <h3 className="text-center">{currentProfile.name || 'Unknown User'}</h3>
          {age !== null && <p className="text-center text-muted"><strong>Age:</strong> {age}</p>}
          {currentProfile.gender && <p className="text-center"><strong>Gender:</strong> {currentProfile.gender}</p>}
          {currentProfile.height && <p className="text-center"><strong>Height:</strong> {currentProfile.height} cm</p>}
          {currentProfile.description && (
            <>
              <h5 className="mt-4">About</h5>
              <p>{currentProfile.description}</p>
            </>
          )}
        </Card>
      </Container>
    </>
  );
};

export default UserProfilePage;