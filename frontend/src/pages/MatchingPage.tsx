import React, { useEffect, useState } from 'react';
import { Accordion } from 'react-bootstrap';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import '../styles/UserList.css';
import SwipeableUserCard from '../components/SwipeableUserCard';
import apiClient from '../utils/apiClient';

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
  const [userConnections, setUserConnections] = useState<User[]>([]);
  const [userRecommendations, setUserRecommendations] = useState<User[]>([]);
  const [connectionRequests, setConnectionRequests] = useState<User[]>([]);
  const [deletingUserIds, setDeletingUserIds] = useState<number[]>([]);
  const navigate = useNavigate();

  const userDataString = localStorage.getItem("user");
  const userData = userDataString ? JSON.parse(userDataString) : null;
  const currentUserId = userData ? userData.id : null;

  useEffect(() => {
    
    console.log(localStorage.getItem("token"));
  }, []);

  useEffect(() => {
    if (currentUserId) {
      fetchUserConnections();
      fetchRecommendations();
      fetchConnectionRequests();
    }
  }, [currentUserId]);

  

  const fetchUserConnections = async () => {

    try {
      const res = await apiClient.get(`/connections/userConnections?id=${currentUserId}`);
      const allConnections: User[] = [
        ...(res.data.sentConnections || []),
        ...(res.data.receivedConnections || []),
      ];
      setUserConnections(allConnections);
    } catch (err) {
      console.error('Failed to fetch userConnections:', err);
    }
  };

  const fetchRecommendations = async () => {
    try {
      const res = await apiClient.get(`/connections/connections?id=${currentUserId}`);
      setUserRecommendations(res.data || []);
    } catch (err) {
      console.error('Failed to fetch recommendations:', err);
    }
  };

  const fetchConnectionRequests = async () => {
    try {
      const res = await apiClient.get(`/connections/connectionRequests?id=${currentUserId}`);
      setConnectionRequests(res.data || []);
    } catch (err) {
      console.error('Failed to fetch connectionRequests:', err);
    }
  };

  const handleChatClick = (e: React.MouseEvent, username: string) => {
    e.stopPropagation();
    navigate(`/chat/${username}`);
  };

  const handleDeleteClick = (e: React.MouseEvent, userId: number) => {
    e.stopPropagation();
    setDeletingUserIds(prev => [...prev, userId]);

    setTimeout(() => {
      setUserConnections(prev => prev.filter(user => user.id !== userId));
      setUserRecommendations(prev => prev.filter(user => user.id !== userId));
      setConnectionRequests(prev => prev.filter(user => user.id !== userId));
      setDeletingUserIds(prev => prev.filter(id => id !== userId));
    }, 300);
  };

  const handleCardClick = (username: string) => {
    navigate(`/user_profile/username/${username}`, { state: { username } });
  };

  const calculateAge = (birthDate?: string) => {
    return birthDate ? dayjs().diff(dayjs(birthDate), 'year') : '?';
  };

  const getProfilePicture = (base64?: string) => {
    return base64 ? `data:image/jpeg;base64,${base64}` : 'https://via.placeholder.com/50';
  };

  const renderUserCards = (users: User[]) =>
    users.map(user => (
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

  return (
    <div className="container mt-4">
      <Accordion alwaysOpen>
        <Accordion.Item eventKey="0">
          <Accordion.Header>Connections ({userConnections.length})</Accordion.Header>
          <Accordion.Body>{renderUserCards(userConnections)}</Accordion.Body>
        </Accordion.Item>
        <Accordion.Item eventKey="1">
          <Accordion.Header>Recommendations ({userRecommendations.length})</Accordion.Header>
          <Accordion.Body>{renderUserCards(userRecommendations)}</Accordion.Body>
        </Accordion.Item>
        <Accordion.Item eventKey="2">
          <Accordion.Header>Connection Requests ({connectionRequests.length})</Accordion.Header>
          <Accordion.Body>{renderUserCards(connectionRequests)}</Accordion.Body>
        </Accordion.Item>
      </Accordion>
    </div>
  );
};

export default MatchingPage;
