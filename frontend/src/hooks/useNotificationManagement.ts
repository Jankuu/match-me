// src/hooks/useNotificationManagement.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
import { ChatMessage } from '../types/ChatMessage'; // Assuming ChatMessage type
// import type { Client } from "@stomp/stompjs"; // Removed: This import is not needed here and can cause circular dependency issues

interface UnreadMessagesMap {
    [userId: number]: number; // Maps user ID to unread count
}

const useNotificationManagement = () => {
    const [connectionNotification, setConnectionNotification] = useState<string[]>([]);
    const [connectionRequestNotification, setConnectionRequestNotification] = useState<string[]>([]);
    const [disconnectedChatUsers, setDisconnectedChatUsers] = useState<number[]>([]);

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

    const hasUnreadMessages = useMemo(() => Object.values(unreadMessages).some(count => count > 0), [unreadMessages]);
    const hasUnreadConnections = unreadConnections;
    const hasUnreadConnectionRequests = unreadConnectionRequests;

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
        if (messageCallbacksRef.current[message.senderProfileId]) {
            console.log(`[NotificationMgr] Chat with ${message.senderProfileId} is OPEN. Dispatching to chat component.`);
            messageCallbacksRef.current[message.senderProfileId](message);
        } else {
            console.log(`[NotificationMgr] Chat with ${message.senderProfileId} is CLOSED. Incrementing unread count.`);
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

    const handleChatDisconnectNotification = useCallback((disconnectedUserId: number) => {
        console.log(`Handling chat disconnect notification for user ID: ${disconnectedUserId}`);
        setDisconnectedChatUsers(prev => {
            if (!prev.includes(disconnectedUserId)) {
                return [...prev, disconnectedUserId];
            }
            return prev;
        });
    }, []);

    const markAllNotificationsAsRead = useCallback(() => {
        setConnectionRequestNotification([]);
        setConnectionNotification([]);
        setUnreadConnectionRequests(false);
        setUnreadConnections(false);
        setUnreadMessages({}); // Also clear unread messages map
        localStorage.removeItem('unreadMessages'); // Clear from local storage
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
            delete newUnreadMessages[userId];
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
        disconnectedChatUsers,
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
        handleChatDisconnectNotification,
        clearDisconnectedChatUser, // This is correctly exposed
    };
};

export default useNotificationManagement;