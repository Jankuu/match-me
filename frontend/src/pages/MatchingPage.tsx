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
  const [userConnections, setUserConnections] = useState<User[]>([]);
  const [userRecommendations, setUserRecommendations] = useState<User[]>([]);
  const [connectionRequests, setConnectionRequests] = useState<User[]>([]);
  const [deletingUserIds, setDeletingUserIds] = useState<number[]>([]);
  const navigate = useNavigate();

  const currentUserId = localStorage.getItem("user.id");

  useEffect(() => {
    if (currentUserId) {
      fetchUserConnections();
      fetchRecommendations();
      fetchConnectionRequests();
    }
  }, [currentUserId]);

  const fetchUserConnections = async () => {
    
    try {
      const res = await axios.get(`http://localhost:8080/connections/userConnections?id=${currentUserId}`);
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
      const res = await axios.get(`http://localhost:8080/connections/connections?id=${currentUserId}`);
      setUserRecommendations(res.data || []);
    } catch (err) {
      console.error('Failed to fetch recommendations:', err);
    }
  };

  const fetchConnectionRequests = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/connections/connectionRequests?id=${currentUserId}`);
      setConnectionRequests(res.data || []);
    } catch (err) {
      console.error('Failed to fetch connectionRequests:', err);
    }
  };

  const handleChatClick = (e: React.MouseEvent, userId: number, username: string) => {
    e.stopPropagation();
    navigate(`/chat/${userId}/${username}`);
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
