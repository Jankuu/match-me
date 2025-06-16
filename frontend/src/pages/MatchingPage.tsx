import React, { useEffect, useState, useCallback } from "react";
import { Accordion } from "react-bootstrap";
import { matchPath, useNavigate } from "react-router-dom";
import apiClient from "../utils/apiClient";
import MatchingSection from "../components/matchingSection/MatchingSection";
import { useWebSocket } from "../providers/WebSocketProvider";

import type { CardUserProfile } from "../types/CardUserProfile";
import type { SwipeEventData } from "react-swipeable";

import "../styles/ColorPallette.css";
import { IMessage } from "@stomp/stompjs";

const MatchingPage: React.FC = () => {
    // State for different categories of user profiles
    const [userConnections, setUserConnections] = useState<CardUserProfile[]>(
        []
    );
    const [userRecommendations, setUserRecommendations] = useState<
        CardUserProfile[]
    >([]);
    const [connectionRequests, setConnectionRequests] = useState<
        CardUserProfile[]
    >([]);
    const navigate = useNavigate(); // Hook for programmatic navigation

    // Destructure WebSocket context values for notifications and marking as read
    const {
        hasUnreadConnections,
        hasUnreadMessages,
        hasUnreadConnectionRequests,
        markConnectionRequestsAsRead,
        markConnectionsAsRead,
        connectionRequestNotification, // Notification for new connection requests
        connectionNotification, // Notification for new established connections
        unreadMessages, // NEW: Get unread messages map
        client,
    } = useWebSocket();

    // State to control which accordion section is active (open)
    const [activeAccordionKey, setActiveAccordionKey] = useState<
        string | string[] | null
    >("CONNECTIONS");

    // Retrieve current user ID from local storage
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    // Assuming 'id' is always present at top-level or 'profile.id' if nested
    const currentUserId = userData?.id || userData?.profile?.id;

    useEffect(() => {
        if (client != null)
            client.subscribe(
                "/user/queue/notifications/disconnect",
                (req: IMessage) => {
                    console.log("disconnect", req.body);

                    // Get current location
                    const location = window.location.pathname;

                    // Try to match the pattern /chat/:id/:username with current path
                    const match = matchPath("/chat/:id/:username", location);

                    if (match && match.params.id === req.body) {
                        // Only navigate if on the matching chat page and id matches req.body
                        navigate("/matching");
                    }
                    fetchUserConnections();
                    fetchRecommendations();
                    fetchConnectionRequests();
                }
            );
    }, [client]);

    // Fetch initial data when currentUserId is available
    useEffect(() => {
        if (currentUserId) {
            fetchUserConnections();
            fetchRecommendations();
            fetchConnectionRequests();
        }
    }, [currentUserId]); // Dependency on currentUserId to refetch if user changes

    // Re-fetch connection requests when a new request notification arrives
    useEffect(() => {
        if (connectionRequestNotification.length > 0) {
            fetchConnectionRequests();
        }
    }, [connectionRequestNotification]); // Dependency on connectionRequestNotification

    // Re-fetch user connections when a new connection notification arrives
    useEffect(() => {
        if (connectionNotification.length > 0) {
            fetchUserConnections();
        }
    }, [connectionNotification]); // Dependency on connectionNotification

    /**
     * Fetches the current user's established connections.
     */
    const fetchUserConnections = async () => {
        try {
            const res = await apiClient.get(`/connections/userConnections`);
            const raw = Array.isArray(res.data.Connections)
                ? res.data.Connections
                : [];

            // Extract the 'other' user profile from each connection object
            const otherUsers = raw
                .map((connection: any) =>
                    connection.sender?.id === currentUserId
                        ? connection.receiver
                        : connection.receiver?.id === currentUserId
                        ? connection.sender
                        : null
                )
                .filter(Boolean) as CardUserProfile[]; // Filter out any nulls and cast to UserProfile[]

            setUserConnections(otherUsers);
        } catch (error) {
            console.error("Error fetching user connections:", error);
            // Handle error (e.g., show a toast)
        }
    };

    /**
     * Fetches user recommendations (profiles to swipe on).
     */
    const fetchRecommendations = async () => {
        try {
            const res = await apiClient.get(`/users/recommendation`);
            setUserRecommendations(res.data || []); // Set recommendations, default to empty array
        } catch (error) {
            console.error("Error fetching recommendations:", error);
            // Handle error
        }
    };

    /**
     * Fetches pending connection requests received by the user.
     */
    const fetchConnectionRequests = async () => {
        try {
            const res = await apiClient.get(`/connections/connectionRequests`);
            // Map to get only the sender's profile for display
            setConnectionRequests(res.data.map((r: any) => r.sender));
        } catch (error) {
            console.error("Error fetching connection requests:", error);
            // Handle error
        }
    };

    /**
     * Handles the accordion section selection.
     * Marks unread notifications as read when their respective sections are opened.
     */
    const handleAccordionSelect = useCallback(
        (
            eventKey: string | string[] | null | undefined,
            e: React.SyntheticEvent<unknown, Event>
        ) => {
            // Set the active key for the accordion
            setActiveAccordionKey(eventKey === undefined ? null : eventKey);

            let isRequestsSectionOpen = false;
            let isConnectionsSectionOpen = false;

            // Determine which section is open based on eventKey type
            if (typeof eventKey === "string") {
                isRequestsSectionOpen = eventKey === "CONNECTION REQUESTS";
                isConnectionsSectionOpen = eventKey === "CONNECTIONS";
            } else if (Array.isArray(eventKey)) {
                isRequestsSectionOpen = eventKey.includes(
                    "CONNECTION REQUESTS"
                );
                isConnectionsSectionOpen = eventKey.includes("CONNECTIONS");
            }

            // Mark notifications as read if the corresponding section is opened
            if (isRequestsSectionOpen) {
                markConnectionRequestsAsRead();
            }
            if (isConnectionsSectionOpen) {
                markConnectionsAsRead();
            }
        },
        [markConnectionRequestsAsRead, markConnectionsAsRead]
    ); // Dependencies for useCallback

    /**
     * Handles clicking the chat button for a user.
     * Navigates to the chat page.
     */
    const handleChatClick = (
        e: React.MouseEvent | SwipeEventData,
        id: number,
        name: string
    ) => {
        navigate(`/chat/${id}/${name}`);
    };

    /**
     * Handles clicking a user profile card.
     * Navigates to the user's detailed profile page.
     */
    const handleCardClick = (id: number) => {
        // Find the profile from any of the lists
        const profile = [
            ...userConnections,
            ...userRecommendations,
            ...connectionRequests,
        ].find((u) => u.id === id);

        if (profile) {
            navigate(`/user_profile/id/${id}`, { state: { profile } }); // Pass profile data via state
        }
    };

    /**
     * Handles sending a connection request to a user.
     */
    const handleSendRequest = async (
        e: React.MouseEvent | SwipeEventData,
        id: number
    ) => {
        try {
            await apiClient.post(`/connections/send?receiverProfileId=${id}`);
            fetchRecommendations(); // Refresh recommendations after sending a request
        } catch (error) {
            console.error("Error sending request:", error);
            // Handle error
        }
    };

    /**
     * Handles accepting a connection request from a sender.
     */
    const handleAcceptRequest = async (
        e: React.MouseEvent | SwipeEventData,
        senderId: number
    ) => {
        try {
            await apiClient.post(
                `/connections/accept?senderProfileId=${senderId}`
            );
            fetchConnectionRequests(); // Refresh requests after accepting
            fetchUserConnections(); // Refresh connections to show the new connection
        } catch (error) {
            console.error("Error accepting request:", error);
            // Handle error
        }
    };

    /**
     * Handles rejecting a connection request from a sender.
     */
    const handleRejectRequest = async (
        e: React.MouseEvent | SwipeEventData,
        senderId: number
    ) => {
        try {
            await apiClient.post(
                `/connections/reject?otherProfileId=${senderId}`
            );
            fetchConnectionRequests(); // Refresh requests after rejecting
            fetchRecommendations(); // Optionally refresh recommendations if rejected users can reappear
        } catch (error) {
            console.error("Error rejecting request:", error);
            // Handle error
        }
    };

    /**
     * Handles removing an existing connection.
     */
    const handleRemoveConnection = async (
        e: React.MouseEvent | SwipeEventData,
        connectedUserId: number
    ) => {
        try {
            // Assuming an API endpoint for removing connections, e.g., /connections/remove
            await apiClient.post(
                `/connections/remove?connectedUserId=${connectedUserId}`
            );
            fetchUserConnections(); // Refresh the connections list
            // Optionally refresh recommendations if removing a connection could lead to new recommendations
            fetchRecommendations();
        } catch (error) {
            console.error("Error removing connection:", error);
            // Handle error (e.g., show a toast notification)
        }
    };

    return (
        <div className="container mt-4">
            {/* Accordion component to organize different matching sections */}
            <Accordion
                alwaysOpen
                activeKey={activeAccordionKey}
                onSelect={handleAccordionSelect}
            >
                {/* Section for established connections */}
                <MatchingSection
                    title="CONNECTIONS"
                    users={userConnections}
                    cardType="connections"
                    onPrimary={handleChatClick} // Primary action: go to chat
                    onSecondary={handleRejectRequest} // Secondary action: remove connection
                    onCardClick={handleCardClick} // Action for clicking the card (view profile)
                    hasUnreadRequests={
                        hasUnreadConnections || hasUnreadMessages
                    } // Indicator for unread connections
                    currentUserId={currentUserId} // NEW: Pass currentUserId
                    unreadMessages={unreadMessages} // NEW: Pass unreadMessages
                />
                {/* Section for new user recommendations */}
                <MatchingSection
                    title="RECOMMENDATIONS"
                    users={userRecommendations}
                    cardType="recommendations"
                    onPrimary={handleSendRequest} // Primary action: send a request
                    onSecondary={handleRejectRequest} // Secondary action: reject/skip recommendation
                    onCardClick={handleCardClick} // Action for clicking the card (view profile)
                    currentUserId={currentUserId} // NEW: Pass currentUserId
                    unreadMessages={unreadMessages} // NEW: Pass unreadMessages
                />
                {/* Section for incoming connection requests */}
                <MatchingSection
                    title="CONNECTION REQUESTS"
                    users={connectionRequests}
                    cardType="requests"
                    onPrimary={handleAcceptRequest} // Primary action: accept request
                    onSecondary={handleRejectRequest} // Secondary action: reject request
                    onCardClick={handleCardClick} // Action for clicking the card (view profile)
                    hasUnreadRequests={hasUnreadConnectionRequests} // Indicator for unread requests
                    currentUserId={currentUserId} // NEW: Pass currentUserId
                    unreadMessages={unreadMessages} // NEW: Pass unreadMessages
                />
            </Accordion>
        </div>
    );
};

export default MatchingPage;
