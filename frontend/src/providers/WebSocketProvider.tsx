// src/providers/WebSocketProvider.tsx

import React, {
    createContext,
    useContext,
    useRef, // Keep useRef for messageCallbacks
} from "react";
import { Client } from "@stomp/stompjs"; // Only Client type needed directly here
import { ChatMessage } from "../types/ChatMessage";

// Import the new custom hooks
import useAuthData from "../hooks/useAuthData";
import useNotificationManagement from "../hooks/useNotificationManagement";
import useWebSocketConnection from "../hooks/useWebSocketConnection";

// Define the structure for storing unread messages per user (moved here for context type)
interface UnreadMessagesMap {
    [userId: number]: number; // Maps user ID to unread count
}

/**
 * Defines the shape of the WebSocket context.
 * This is the public API of the WebSocketProvider.
 */
interface WebSocketContextType {
    isConnected: boolean;
    client: Client | null; // The STOMP client instance
    sendMessage: (receiverId: number, message: string) => void;

    // Notification states and actions
    connectionNotification: string[];
    connectionRequestNotification: string[];
    hasUnreadConnections: boolean;
    hasUnreadConnectionRequests: boolean;
    markAllNotificationsAsRead: () => void;
    markConnectionRequestsAsRead: () => void;
    markConnectionsAsRead: () => void;

    // Unread message counts per user and global flag
    unreadMessages: UnreadMessagesMap;
    markMessagesAsReadForUser: (userId: number) => void;
    hasUnreadMessages: boolean;

    // Callback registration for chat pages
    registerMessageCallback: (userId: number, callback: (message: ChatMessage) => void) => () => void;

    // Auth data refresh (e.g., after login/logout)
    refreshAuthData: () => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

/**
 * WebSocketProvider Component
 * This component provides a centralized WebSocket connection and manages
 * various types of real-time notifications for the entire application.
 * It composes several smaller, specialized hooks to achieve its functionality.
 */
export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    // 1. Use the authentication data hook
    const { jwtToken, currentUserId, refreshAuthData } = useAuthData();

    // 2. Use a ref for message callbacks to ensure a stable reference across renders
    //    This is crucial for the WebSocket connection hook to dispatch messages
    //    to the correct active chat components without causing unnecessary re-renders.
    const messageCallbacks = useRef<{ [userId: number]: (message: ChatMessage) => void }>({});

    // Existing: Register a callback for a specific user's chat messages
    // This is exposed to consumers of the context to allow chat pages to register their handlers.
    const registerMessageCallback = React.useCallback((userId: number, callback: (message: ChatMessage) => void) => {
        messageCallbacks.current[userId] = callback;
        return () => {
            delete messageCallbacks.current[userId];
        };
    }, []);

    // 3. Use the notification management hook
    const {
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
        handleConnectionNotification, // Passed to useWebSocketConnection
        handleConnectionRequestNotification, // Passed to useWebSocketConnection
        handleChatMessage, // Passed to useWebSocketConnection
    } = useNotificationManagement();

    // 4. Use the WebSocket connection hook, passing necessary auth data and notification handlers
    const { client, isConnected, sendMessage } = useWebSocketConnection({
        jwtToken,
        currentUserId,
        onChatMessage: handleChatMessage, // Pass the handler from useNotificationManagement
        onConnectionNotification: handleConnectionNotification, // Pass the handler from useNotificationManagement
        onConnectionRequestNotification: handleConnectionRequestNotification, // Pass the handler from useNotificationManagement
        messageCallbacksRef: messageCallbacks, // Pass the ref for message dispatching
    });

    // Provide all necessary values through the context
    return (
        <WebSocketContext.Provider
            value={{
                sendMessage,
                isConnected,
                client, // The STOMP client instance from the connection hook
                connectionNotification,
                connectionRequestNotification,
                hasUnreadConnections,
                hasUnreadConnectionRequests,
                markAllNotificationsAsRead,
                markConnectionRequestsAsRead,
                markConnectionsAsRead,
                unreadMessages,
                markMessagesAsReadForUser,
                registerMessageCallback,
                refreshAuthData,
                hasUnreadMessages,
            }}
        >
            {children}
        </WebSocketContext.Provider>
    );
};

/**
 * Custom hook to consume the WebSocket context.
 * Throws an error if used outside of a WebSocketProvider.
 */
export const useWebSocket = () => {
    const ctx = useContext(WebSocketContext);
    if (!ctx)
        throw new Error("useWebSocket must be used within a WebSocketProvider");
    return ctx;
};