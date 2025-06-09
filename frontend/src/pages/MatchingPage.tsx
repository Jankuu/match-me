// src/pages/MatchingPage.tsx
import React, { useEffect, useState, useCallback } from "react";
import { Accordion } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import apiClient from "../utils/apiClient";
import MatchingSection from "../components/MatchingSection";
import { useWebSocket } from "../context/WebSocketContext";

import type { UserProfile } from "../types/UserProfile";
import type { SwipeEventData } from "react-swipeable";

import "../styles/ColorPallette.css";
import NotificationBanner from "../components/Notification";

const MatchingPage: React.FC = () => {
    const [userConnections, setUserConnections] = useState<UserProfile[]>([]);
    const [userRecommendations, setUserRecommendations] = useState<
        UserProfile[]
    >([]);
    const [connectionRequests, setConnectionRequests] = useState<UserProfile[]>(
        []
    );
    const navigate = useNavigate();

    const {
        hasUnreadConnections,
        hasUnreadConnectionRequests,
        markConnectionRequestsAsRead,
        markConnectionsAsRead,
        connectionRequestNotification,
        connectionNotification,
    } = useWebSocket();

    const [activeAccordionKey, setActiveAccordionKey] = useState<
        string | string[] | null
    >("CONNECTIONS");

    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    const currentUserId = userData?.id || userData?.profile?.id;
    const currentUserProfileId = userData?.profile?.id;

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

    useEffect(() => {
        if (connectionRequestNotification.length > 0) {
            fetchConnectionRequests();
        }
    }, [connectionRequestNotification]);

    useEffect(() => {
        if (connectionNotification.length > 0) {
            fetchUserConnections();
        }
    }, [connectionNotification]);

    const fetchUserConnections = async () => {
        const res = await apiClient.get("/connections/connections");

        const otherUsers = res.data
            .map((connection: any) =>
                connection.sender?.id === currentUserProfileId
                    ? connection.receiver
                    : connection.receiver?.id === currentUserProfileId
                    ? connection.sender
                    : null
            )
            .filter(Boolean) as UserProfile[];
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

    const handleAccordionSelect = useCallback(
        (
            eventKey: string | string[] | null | undefined,
            e: React.SyntheticEvent<unknown, Event>
        ) => {
            setActiveAccordionKey(eventKey === undefined ? null : eventKey);

            let isRequestsSectionOpen = false;
            let isConnectionsSectionOpen = false;

            if (typeof eventKey === "string") {
                isRequestsSectionOpen = eventKey === "CONNECTION REQUESTS";
                isConnectionsSectionOpen = eventKey === "CONNECTIONS";
            } else if (Array.isArray(eventKey)) {
                isRequestsSectionOpen = eventKey.includes(
                    "CONNECTION REQUESTS"
                );
                isConnectionsSectionOpen = eventKey.includes("CONNECTIONS");
            }

            if (isRequestsSectionOpen) {
                markConnectionRequestsAsRead();
            }
            if (isConnectionsSectionOpen) {
                markConnectionsAsRead();
            }
        },
        [markConnectionRequestsAsRead, markConnectionsAsRead]
    );

    // Убираем 'if ('stopPropagation' in e) e.stopPropagation();' из этих функций
    const handleChatClick = (
        e: React.MouseEvent | SwipeEventData,
        id: number,
        name: string,
        otherUserProfile: UserProfile
    ) => {
        // if ('stopPropagation' in e) e.stopPropagation(); // УДАЛИТЕ ЭТУ СТРОКУ
        navigate(`/chat/${id}/${name}`, {
            state: { otherUserProfile },
        });
    };

    const handleCardClick = (id: number) => {
        const profile = [
            ...userConnections,
            ...userRecommendations,
            ...connectionRequests,
        ].find((u) => u.id === id);

        if (profile) {
            navigate(`/user_profile/id/${id}`, { state: { profile } });
        }
    };

    const handleSendRequest = async (
        e: React.MouseEvent | SwipeEventData,
        id: number
    ) => {
        // if ('stopPropagation' in e) e.stopPropagation(); // УДАЛИТЕ ЭТУ СТРОКУ
        await apiClient.post(`/connections/send?receiverProfileId=${id}`);
        fetchRecommendations();
    };

    const handleAcceptRequest = async (
        e: React.MouseEvent | SwipeEventData,
        senderId: number
    ) => {
        // if ('stopPropagation' in e) e.stopPropagation(); // УДАЛИТЕ ЭТУ СТРОКУ
        await apiClient.post(`/connections/accept?senderProfileId=${senderId}`);
        fetchConnectionRequests();
        fetchUserConnections();
    };

    const handleRejectRequest = async (
        e: React.MouseEvent | SwipeEventData,
        senderId: number
    ) => {
        // if ('stopPropagation' in e) e.stopPropagation(); // УДАЛИТЕ ЭТУ СТРОКУ
        await apiClient.post(`/connections/reject?senderProfileId=${senderId}`);
        console.log("Rejects");
        fetchUserConnections();
        fetchConnectionRequests();
        fetchRecommendations();
    };

    const handleRemoveConnection = async (
        e: React.MouseEvent | SwipeEventData,
        senderId: number
    ) => {
        // if ('stopPropagation' in e) e.stopPropagation(); // УДАЛИТЕ ЭТУ СТРОКУ
        // await apiClient.post(`/connections/reject?senderProfileId=${senderId}`);
        // fetchConnectionRequests();
        // fetchRecommendations();
    };

    return (
        <div className="container mt-4">
            <Accordion
                alwaysOpen
                activeKey={activeAccordionKey}
                onSelect={handleAccordionSelect}
            >
                <MatchingSection
                    title="CONNECTIONS"
                    users={userConnections}
                    cardType="connections"
                    onPrimary={handleChatClick}
                    onSecondary={handleRejectRequest}
                    onCardClick={handleCardClick}
                    hasUnreadRequests={hasUnreadConnections}
                ></MatchingSection>

                <MatchingSection
                    title="RECOMMENDATIONS"
                    users={userRecommendations}
                    cardType="recommendations"
                    onPrimary={handleSendRequest}
                    onSecondary={handleRejectRequest}
                    onCardClick={handleCardClick}
                ></MatchingSection>

                <MatchingSection
                    title="CONNECTION REQUESTS"
                    users={connectionRequests}
                    cardType="requests"
                    onPrimary={handleAcceptRequest}
                    onSecondary={handleRejectRequest}
                    onCardClick={handleCardClick}
                    hasUnreadRequests={hasUnreadConnectionRequests}
                ></MatchingSection>
            </Accordion>
        </div>
    );
};

export default MatchingPage;
