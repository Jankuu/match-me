// src/components/UserProfilePageLoader.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import UserProfileComponent from './UserProfileComponent'; // Это ваш компонент для отображения профиля
import apiClient from '../utils/apiClient'; // Убедитесь, что у вас есть apiClient
import { UserProfile } from '../types/UserProfile'; // Тип UserProfile

const UserProfilePageLoader: React.FC = () => {
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
          // Опционально: перенаправить, если профиль не найден
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

  if (isLoading) {
    return <div className="text-center mt-5">Загрузка профиля...</div>;
  }

  if (error) {
    return <div className="alert alert-danger text-center mt-5">{error}</div>;
  }

  if (!currentProfile) {
    // Это произойдет, если isLoading=false, нет error, но и нет currentProfile
    // (например, если API вернул null или undefined без ошибки)
    return <div className="text-center mt-5">Профиль пользователя не найден.</div>;
  }

  // Рендерим UserProfileComponent с загруженным/полученным профилем
  return <UserProfileComponent profile={currentProfile} />;
};

export default UserProfilePageLoader;