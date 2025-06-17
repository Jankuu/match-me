// src/hooks/useNotificationManagement.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
import { ChatMessage } from '../types/ChatMessage'; // Assuming ChatMessage type
import type { Client } from "@stomp/stompjs"; // Added Client for messageCallbacksRef type

interface UnreadMessagesMap {
    [userId: number]: number; // Maps user ID to unread count
}

const useNotificationManagement = () => {
    // ... (existing states) ...
    const [connectionNotification, setConnectionNotification] = useState<string[]>([]);
    const [connectionRequestNotification, setConnectionRequestNotification] = useState<string[]>([]);
    const [disconnectedChatUsers, setDisconnectedChatUsers] = useState<number[]>([]); // NEW: State for disconnected chat users

    const [unreadConnectionRequests, setUnreadConnectionRequests] = useState(false);
    const [unreadConnections, setUnreadConnections] = useState(false);
    const [unreadMessages, setUnreadMessages] = useState<UnreadMessagesMap>(() => {
        try {
            const stored = localStorage.getItem('unreadMessages');
            return stored ? JSON.parse(stored) : {};
        } catch (e) {
            console.error("Failed to parse unreadMessages from localStorage", e);
            return {};
        }
    });

    // ... (existing hasUnreadMessages, hasUnreadConnections, hasUnreadConnectionRequests, mark functions) ...

    const hasUnreadMessages = useMemo(() => Object.values(unreadMessages).some(count => count > 0), [unreadMessages]);

    const hasUnreadConnections = unreadConnections;
    const hasUnreadConnectionRequests = unreadConnectionRequests;

    // Handlers for incoming WebSocket messages
    const handleConnectionNotification = useCallback((body: string, currentUserId: number | null) => {
        console.log("Handling connection notification in useNotificationManagement:", body);
        setConnectionNotification(prev => [...prev, body]);
        if (currentUserId !== null) {
            setUnreadConnections(true);
        }
    }, []);

    const handleConnectionRequestNotification = useCallback((body: string, currentUserId: number | null) => {
        console.log("Handling connection request notification in useNotificationManagement:", body);
        setConnectionRequestNotification(prev => [...prev, body]);
        if (currentUserId !== null) {
            setUnreadConnectionRequests(true);
        }
    }, []);

    const handleChatMessage = useCallback((
        message: ChatMessage,
        currentUserId: number | null,
        messageCallbacksRef: React.MutableRefObject<{ [userId: number]: (message: ChatMessage) => void }>
    ) => {
        console.log("Handling chat message in useNotificationManagement:", message);
        // Check if there's an active callback for this sender (i.e., chat window is open)
        if (messageCallbacksRef.current[message.senderProfileId]) {
            // If the chat is open, dispatch the message directly to the chat component
            messageCallbacksRef.current[message.senderProfileId](message);
        } else {
            // If chat is not open, increment unread count for that user
            setUnreadMessages(prev => {
                const newUnreadMessages = {
                    ...prev,
                    [message.senderProfileId]: (prev[message.senderProfileId] || 0) + 1
                };
                localStorage.setItem('unreadMessages', JSON.stringify(newUnreadMessages));
                return newUnreadMessages;
            });
        }
    }, []);

    // NEW: Handler for chat disconnect notifications
    const handleChatDisconnectNotification = useCallback((disconnectedUserId: number) => {
        console.log(`Handling chat disconnect notification for user ID: ${disconnectedUserId}`);
        setDisconnectedChatUsers(prev => {
            if (!prev.includes(disconnectedUserId)) {
                return [...prev, disconnectedUserId];
            }
            return prev;
        });
    }, []);


    // Functions to mark notifications as read
    const markAllNotificationsAsRead = useCallback(() => {
        setConnectionRequestNotification([]);
        setConnectionNotification([]);
        setUnreadConnectionRequests(false);
        setUnreadConnections(false);
    }, []);

    const markConnectionRequestsAsRead = useCallback(() => {
        setUnreadConnectionRequests(false);
    }, []);

    const markConnectionsAsRead = useCallback(() => {
        setUnreadConnections(false);
    }, []);

    const markMessagesAsReadForUser = useCallback((userId: number) => {
        setUnreadMessages(prev => {
            const newUnreadMessages = { ...prev };
            delete newUnreadMessages[userId]; // Remove the entry for this user
            localStorage.setItem('unreadMessages', JSON.stringify(newUnreadMessages));
            return newUnreadMessages;
        });
    }, []);

    const clearDisconnectedChatUser = useCallback((userId: number) => {
        setDisconnectedChatUsers(prev => prev.filter(id => id !== userId));
    }, []);

    return {
        connectionNotification,
        connectionRequestNotification,
        disconnectedChatUsers, // NEW: Expose disconnected chat users
        hasUnreadConnections,
        hasUnreadConnectionRequests,
        unreadMessages,
        hasUnreadMessages,
        markAllNotificationsAsRead,
        markConnectionRequestsAsRead,
        markConnectionsAsRead,
        markMessagesAsReadForUser,
        handleConnectionNotification,
        handleConnectionRequestNotification,
        handleChatMessage,
        handleChatDisconnectNotification, // NEW: Expose the handler
        clearDisconnectedChatUser,
    };
};

export default useNotificationManagement;