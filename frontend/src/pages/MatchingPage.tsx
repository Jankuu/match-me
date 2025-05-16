
import React, { useEffect, useState } from 'react';
import { Accordion } from 'react-bootstrap';
import axios from 'axios';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import '../styles/UserList.css';
import SwipeableUserCard from '../components/SwipeableUserCard';

type User = {
    id: number;
    username: string;
    email: string;
    profile?: {
      name?: string;
      gender?: string;
      birthDate?: string;
      profilePicture?: string;
    };
  };

const MatchingPage: React.FC = () => {

    

  const [users, setUsers] = useState<User[]>([]);
  const navigate = useNavigate();
  const [deletingUserIds, setDeletingUserIds] = useState<number[]>([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async (page = 0, size = 10
  ) => {
    try {
      const response = await axios.get(`http://localhost:8080/users/all?page=${page}&size=${size}`);
      // connections

      // recomindations
      setUsers(response.data.content);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const handleChatClick = (e: React.MouseEvent, userId: number, username: string) => {
    e.stopPropagation();
    console.log(`Chat with user: ${userId}`);
    // navigate(`/chat/${userId}`); // Redirect to chat page with user ID
    navigate(`/chat/${userId}/${username}`); // Redirect to chat page with user ID
  };

  const handleDeleteClick = (e: React.MouseEvent, userId: number) => {
    e.stopPropagation(); // Not to call onCardClick
  
    setDeletingUserIds((prev) => [...prev, userId]);
  
    setTimeout(() => {
      setUsers((prev) => prev.filter((user) => user.id !== userId));
      setDeletingUserIds((prev) => prev.filter((id) => id !== userId));
    }, 300); // Like in CSS
  };

  const handleCardClick = (username: string) => {
    navigate(`/user_profile/username/${username}`, { state: { username } });
  };

  const calculateAge = (birthDate: string | undefined) => {
    if (!birthDate) return '?';
    return dayjs().diff(dayjs(birthDate), 'year');
  };

  const getProfilePicture = (base64: string | undefined) => {
    // if (!base64) return 'https://via.placeholder.com/50';
    return `data:image/jpeg;base64,${base64}`;
  };

  const renderUserCards = (filteredUsers: User[]) =>
    filteredUsers.map((user) => (
      <SwipeableUserCard
        key={user.id}
        user={user}
        onCardClick={handleCardClick}
        onChatClick={handleChatClick}
        onDeleteClick={handleDeleteClick}
        onSwipeLeft={() => handleDeleteClick(null as any, user.id)}
        isDeleting={deletingUserIds.includes(user.id)}
        getProfilePicture={getProfilePicture}
        calculateAge={calculateAge}
      />
    ));

  const maleUsers = users.filter((u) => u.profile?.gender?.toLowerCase() === 'man');
  const femaleUsers = users.filter((u) => u.profile?.gender?.toLowerCase() === 'woman');

  return (
    <div className="container mt-4">
      <Accordion alwaysOpen>
        <Accordion.Item eventKey="0">
          <Accordion.Header>Man (Connections) ({maleUsers.length})</Accordion.Header>
          <Accordion.Body>{renderUserCards(maleUsers)}</Accordion.Body>
        </Accordion.Item>
        <Accordion.Item eventKey="1">
          <Accordion.Header>Woman (Recommendations) ({femaleUsers.length})</Accordion.Header>
          <Accordion.Body>{renderUserCards(femaleUsers)}</Accordion.Body>
        </Accordion.Item>
      </Accordion>
    </div>
  );
};


export default MatchingPage