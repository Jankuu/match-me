// src/hooks/useNotificationManagement.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { ChatMessage } from '../types/ChatMessage'; // Assuming ChatMessage type is available

// Define the structure for storing unread messages per user
interface UnreadMessagesMap {
    [userId: number]: number; // Maps user ID to unread count
}

/**
 * useNotificationManagement Custom Hook
 * Manages all states and logic related to various types of notifications:
 * - Connection notifications (new connections)
 * - Connection request notifications
 * - Unread chat message counts per user
 * - Global flags for any unread notifications
 * It also provides methods to mark notifications as read.
 */
const useNotificationManagement = () => {
    const [connectionNotification, setConnectionNotification] = useState<string[]>([]);
    const [connectionRequestNotification, setConnectionRequestNotification] = useState<string[]>([]);

    const [hasUnreadConnections, setHasUnreadConnections] = useState(false);
    const [hasUnreadConnectionRequests, setHasUnreadConnectionRequests] = useState(false);

    const [unreadMessages, setUnreadMessages] = useState<UnreadMessagesMap>({});
    const [hasUnreadMessages, setHasUnreadMessages] = useState(false); // Global flag for any unread chat messages

    /**
     * Effect to update `hasUnreadConnections` flag based on `connectionNotification` array.
     */
    useEffect(() => {
        setHasUnreadConnections(connectionNotification.length > 0);
    }, [connectionNotification]);

    /**
     * Effect to update `hasUnreadConnectionRequests` flag based on `connectionRequestNotification` array.
     */
    useEffect(() => {
        setHasUnreadConnectionRequests(connectionRequestNotification.length > 0);
    }, [connectionRequestNotification]);

    /**
     * Effect to update `hasUnreadMessages` global flag based on `unreadMessages` map.
     */
    useEffect(() => {
        setHasUnreadMessages(Object.keys(unreadMessages).length > 0);
    }, [unreadMessages]);

    /**
     * Clears all types of notifications and resets their unread flags.
     * Memoized for stable reference.
     */
    const markAllNotificationsAsRead = useCallback(() => {
        setHasUnreadConnections(false);
        setHasUnreadConnectionRequests(false);
        setConnectionNotification([]);
        setConnectionRequestNotification([]);
    }, []);

    /**
     * Clears connection request notifications and resets its unread flag.
     * Memoized for stable reference.
     */
    const markConnectionRequestsAsRead = useCallback(() => {
        setHasUnreadConnectionRequests(false);
        setConnectionRequestNotification([]);
    }, []);

    /**
     * Clears connection notifications and resets its unread flag.
     * Memoized for stable reference.
     */
    const markConnectionsAsRead = useCallback(() => {
        setHasUnreadConnections(false);
        setConnectionNotification([]);
    }, []);

    /**
     * Marks messages from a specific user as read, updating the unread count map.
     * Memoized for stable reference.
     * @param userId The ID of the user whose messages should be marked as read.
     */
    const markMessagesAsReadForUser = useCallback((userId: number) => {
        setUnreadMessages((prev) => {
            const newState = { ...prev };
            delete newState[userId]; // Remove the unread count for this user
            return newState;
        });
        // The `useEffect` for `hasUnreadMessages` will automatically update after this state change.
    }, []);

    /**
     * Handles incoming connection notifications.
     * @param notificationBody The raw string body of the notification.
     * @param currentUserId The ID of the current user, used for filtering.
     */
    const handleConnectionNotification = useCallback((notificationBody: string, currentUserId: number | null) => {
        try {
            const notificationData = JSON.parse(notificationBody);
            // Prevent notification for current user's own actions
            if (currentUserId !== null && notificationData.id === currentUserId) {
                console.log("Skipping connection notification for current user's own ID.");
                return;
            }
            setConnectionNotification((prev) => [...prev, notificationBody]);
        } catch (error) {
            console.error("Failed to parse connection notification JSON:", error, notificationBody);
            setConnectionNotification((prev) => [...prev, notificationBody]); // Add raw body if parsing fails
        }
    }, []);

    /**
     * Handles incoming connection request notifications.
     * @param requestBody The raw string body of the request.
     * @param currentUserId The ID of the current user, used for filtering.
     */
    const handleConnectionRequestNotification = useCallback((requestBody: string, currentUserId: number | null) => {
        try {
            const requestData = JSON.parse(requestBody);
            // Prevent notification for current user's own actions
            if (currentUserId !== null && requestData.id === currentUserId) {
                console.log("Skipping connection request notification for current user's own ID.");
                return;
            }
            setConnectionRequestNotification((prev) => [...prev, requestBody]);
        } catch (error) {
            console.error("Failed to parse connection request notification JSON:", error, requestBody);
            setConnectionRequestNotification((prev) => [...prev, requestBody]); // Add raw body if parsing fails
        }
    }, []);

    /**
     * Handles incoming chat messages, updating unread counts and notifying active chat pages.
     * @param messageObj The parsed ChatMessage object.
     * @param currentUserId The ID of the current user.
     * @param messageCallbacksRef A ref to the map of active chat page callbacks.
     */
    const handleChatMessage = useCallback((messageObj: ChatMessage, currentUserId: number | null, messageCallbacksRef: React.MutableRefObject<{ [userId: number]: (message: ChatMessage) => void }>) => {
        if (currentUserId === null) return;

        // Determine the ID of the 'other' user in the chat
        const otherUserId = messageObj.senderProfileId === currentUserId
            ? messageObj.receiverProfileId
            : messageObj.senderProfileId;

        // Update unread message count for that 'other' user
        setUnreadMessages((prev) => ({
            ...prev,
            [otherUserId]: (prev[otherUserId] || 0) + 1,
        }));

        // If there's an active chat page listening for this user, notify it
        if (messageCallbacksRef.current[otherUserId]) {
            messageCallbacksRef.current[otherUserId](messageObj);
        }
    }, []);

    return {
        connectionNotification,
        connectionRequestNotification,
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
    };
};

export default useNotificationManagement;