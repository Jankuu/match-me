import React, { useEffect, useState } from 'react';
import { Accordion } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import apiClient from '../utils/apiClient';
import MatchingSection from '../components/MatchingSection';

import type { UserProfile } from '../types/UserProfile';
import type { SwipeEventData } from 'react-swipeable';

import "../styles/ColorPallette.css";

const MatchingPage: React.FC = () => {
  const [userConnections, setUserConnections] = useState<UserProfile[]>([]);
  const [userRecommendations, setUserRecommendations] = useState<UserProfile[]>([]);
  const [connectionRequests, setConnectionRequests] = useState<UserProfile[]>([]);
  const navigate = useNavigate();

  const userData = JSON.parse(localStorage.getItem("user") || "{}");
  const currentUserId = userData?.id || userData?.profile?.id;

  useEffect(() => {
    if (currentUserId) {
      fetchUserConnections();
      fetchRecommendations();
      fetchConnectionRequests();
    }
  }, [currentUserId]);

  const fetchUserConnections = async () => {
    const res = await apiClient.get(`/connections/userConnections`);
    const raw = Array.isArray(res.data.Connections) ? res.data.Connections : [];

    const otherUsers = raw.map((connection: any) =>
      connection.sender?.id === currentUserId ? connection.receiver
      : connection.receiver?.id === currentUserId ? connection.sender
      : null
    ).filter(Boolean) as UserProfile[];

    setUserConnections(otherUsers);
  };

  const fetchRecommendations = async () => {
    const res = await apiClient.get(`/users/recommendation`);
    setUserRecommendations(res.data || []);
  };

  const fetchConnectionRequests = async () => {
    const res = await apiClient.get(`/connections/connectionRequests`);
    setConnectionRequests(res.data.map((r: any) => r.sender));
  };

  const handleChatClick = (e: React.MouseEvent | SwipeEventData, id: number, name: string) => {
    if ('stopPropagation' in e) e.stopPropagation();
    // TODO Chat has to take ID.
    navigate(`/chat/${id}/${name}`);
  };

  const handleCardClick = (id: number) => {
    const profile = [...userConnections, ...userRecommendations, ...connectionRequests]
      .find((u) => u.id === id);
  
    if (profile) {
      navigate(`/user_profile/id/${id}`, { state: { profile } });
    }
  };
  

  const handleSendRequest = async (e: React.MouseEvent | SwipeEventData, id: number) => {
    if ('stopPropagation' in e) e.stopPropagation();
    await apiClient.post(`/connections/send?receiverProfileId=${id}`);
    fetchRecommendations();
  };

  const handleAcceptRequest = async (e: React.MouseEvent | SwipeEventData, senderId: number) => {
    if ('stopPropagation' in e) e.stopPropagation();
    await apiClient.post(`/connections/accept?senderProfileId=${senderId}`);
    fetchConnectionRequests();
    fetchUserConnections();
  };

  const handleRejectRequest = async (e: React.MouseEvent | SwipeEventData, senderId: number) => {
    if ('stopPropagation' in e) e.stopPropagation(); // same

    // const confirmed = window.confirm("Are you sure you want to reject?");

    // if (!confirmed) {
    //   fetchConnectionRequests();
    //   fetchRecommendations();
    //   return;
    // }
    await apiClient.post(`/connections/reject?senderProfileId=${senderId}`);
    fetchConnectionRequests();
    fetchRecommendations();
  };

  return (
    <div className="container mt-4">
      <Accordion alwaysOpen >
        <MatchingSection
          title="CONNECTIONS"
          users={userConnections}
          cardType="connections"
          onPrimary={handleChatClick}
          onSecondary={handleRejectRequest}
          onCardClick={handleCardClick}
        />
        <MatchingSection
          title="RECOMMENDATIONS"
          users={userRecommendations}
          cardType="recommendations"
          onPrimary={handleSendRequest}
          onSecondary={handleRejectRequest}
          onCardClick={handleCardClick}
        />
        <MatchingSection
          title="CONNECTION REQUESTS"
          users={connectionRequests}
          cardType="requests"
          onPrimary={handleAcceptRequest}
          onSecondary={handleRejectRequest}
          onCardClick={handleCardClick}
        />
      </Accordion>
    </div>
  );
};

export default MatchingPage;
