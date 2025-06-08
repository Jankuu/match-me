// src/providers/WebSocketProvider.tsx

import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";
import { Client, IMessage } from "@stomp/stompjs";
import { ChatMessage } from "../types/ChatMessage";

// Define the structure for storing unread messages per user
interface UnreadMessagesMap {
    [userId: number]: number; // Maps user ID to unread count
}

interface WebSocketContextType {
    isConnected: boolean;
    client: Client | null;
    sendMessage: (receiverId: number, message: string) => void;

    // Notifications for connections/requests (existing)
    connectionNotification: string[];
    connectionRequestNotification: string[];
    hasUnreadConnections: boolean;
    hasUnreadConnectionRequests: boolean;

    markAllNotificationsAsRead: () => void;
    markConnectionRequestsAsRead: () => void;
    markConnectionsAsRead: () => void;

    //Unread message counts per user
    unreadMessages: UnreadMessagesMap;
    markMessagesAsReadForUser: (userId: number) => void;
    // Callback to notify specific components about new messages
    registerMessageCallback: (userId: number, callback: (message: ChatMessage) => void) => () => void;

    refreshAuthData: () => void;

    // NEW: Global flag for any unread messages
    hasUnreadMessages: boolean; // Add this line
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const client = useRef<Client | null>(null);

    const [isConnected, setIsConnected] = useState(false);
    const [connectionNotification, setConnectionNotification] = useState<
        string[]
    >([]);
    const [connectionRequestNotification, setConnectionRequestNotification] =
        useState<string[]>([]);

    const [hasUnreadConnections, setHasUnreadConnections] = useState(false);
    const [hasUnreadConnectionRequests, setHasUnreadConnectionRequests] =
        useState(false);

    // Existing: State for unread message counts per user
    const [unreadMessages, setUnreadMessages] = useState<UnreadMessagesMap>({});

    // NEW: Global flag for any unread messages across all chats
    const [hasUnreadMessages, setHasUnreadMessages] = useState(false); // Add this line

    const [currentUserId, setCurrentUserId] = useState<number | null>(null);
    const [jwtToken, setJwtToken] = useState<string | null>(null);

    // Existing: Ref to store message callbacks for active chat pages
    const messageCallbacks = useRef<{ [userId: number]: (message: ChatMessage) => void }>({});

    // Existing: Register a callback for a specific user's chat messages
    const registerMessageCallback = useCallback((userId: number, callback: (message: ChatMessage) => void) => {
        messageCallbacks.current[userId] = callback;
        return () => {
            delete messageCallbacks.current[userId];
        };
    }, []);

    // Existing: Effects for connection notifications
    useEffect(() => {
        if (connectionNotification.length > 0) {
            setHasUnreadConnections(true);
        }
    }, [connectionNotification]);

    useEffect(() => {
        if (connectionRequestNotification.length > 0) {
            setHasUnreadConnectionRequests(true);
        }
    }, [connectionRequestNotification]);

    // NEW: Effect to update hasUnreadMessages when unreadMessages map changes
    useEffect(() => {
        // Check if there's at least one user with unread messages
        setHasUnreadMessages(Object.keys(unreadMessages).length > 0);
    }, [unreadMessages]); // Trigger this effect whenever unreadMessages state changes

    const markAllNotificationsAsRead = useCallback(() => {
        setHasUnreadConnections(false);
        setHasUnreadConnectionRequests(false);
        setConnectionNotification([]);
        setConnectionRequestNotification([]);
    }, []);

    const markConnectionRequestsAsRead = useCallback(() => {
        setHasUnreadConnectionRequests(false);
        setConnectionRequestNotification([]);
    }, []);

    const markConnectionsAsRead = useCallback(() => {
        setHasUnreadConnections(false);
        setConnectionNotification([]);
    }, []);

    // Existing: Mark messages as read for a specific user
    const markMessagesAsReadForUser = useCallback((userId: number) => {
        setUnreadMessages((prev) => {
            const newState = { ...prev };
            delete newState[userId]; // Remove the unread count for this user
            return newState;
        });
        // Note: The `useEffect` for `hasUnreadMessages` will automatically update after this.
    }, []);

    const refreshAuthData = useCallback(() => {
        const token = localStorage.getItem("token");
        setJwtToken(token);

        try {
            const userJson = localStorage.getItem("user");
            if (userJson) {
                const user = JSON.parse(userJson);
                if (typeof user.id === 'number') {
                    setCurrentUserId(user.id);
                } else if (typeof user.id === 'string') {
                    setCurrentUserId(parseInt(user.id, 10));
                } else {
                    console.warn("User ID in localStorage is not a number or string:", user.id);
                    setCurrentUserId(null);
                }
            } else {
                console.warn("User object not found in localStorage. Cannot determine current user ID for notification filtering.");
                setCurrentUserId(null);
            }
        } catch (e) {
            console.error("Error parsing user data from localStorage:", e);
            setCurrentUserId(null);
        }
        console.log("refreshAuthData called. New JWT State:", token ? "present" : "null", "New User ID State:", currentUserId);
    }, [currentUserId]);

    useEffect(() => {
        refreshAuthData();
    }, [refreshAuthData]);

    useEffect(() => {
        if (jwtToken == null) {
            console.log("JWT is null, cannot establish WebSocket connection.");
            if (client.current && client.current.connected) {
                client.current.deactivate();
                setIsConnected(false);
            }
            return;
        }

        if (currentUserId === null) {
            console.log("Current user ID not loaded yet, waiting to establish WebSocket connection.");
            return;
        }

        if (client.current && client.current.connected) {
            console.log("Deactivating existing WebSocket client for reconnection.");
            client.current.deactivate();
        }

        const stompClient = new Client({
            brokerURL: `ws://localhost:8080/ws?token=${jwtToken}`,
            connectHeaders: {
                Authorization: `Bearer ${jwtToken}`,
            },
            debug: (str) => console.log("[STOMP]", str),
            reconnectDelay: 5000,
            onConnect: () => {
                console.log("Connected to WebSocket");
                setIsConnected(true);

                // Subscribe to messages
                stompClient.subscribe(
                    "/user/queue/messages",
                    (msg: IMessage) => {
                        console.log("New message:", msg.body);
                        try {
                            const messageObj: ChatMessage = JSON.parse(msg.body);

                            const otherUserId = messageObj.senderProfileId === currentUserId
                                ? messageObj.receiverProfileId
                                : messageObj.senderProfileId;

                            // Update unread message count
                            setUnreadMessages((prev) => ({
                                ...prev,
                                [otherUserId]: (prev[otherUserId] || 0) + 1,
                            }));

                            // If there's an active chat page listening for this user, notify it
                            if (messageCallbacks.current[otherUserId]) {
                                messageCallbacks.current[otherUserId](messageObj);
                            }

                        } catch (error) {
                            console.error("Failed to parse message JSON:", error, msg.body);
                        }
                    }
                );

                // Subscribe to connection notifications (existing logic)
                stompClient.subscribe(
                    "/user/queue/notifications/connection",
                    (con: IMessage) => {
                        console.log("New connection notification received:", con.body);
                        try {
                            const notificationData = JSON.parse(con.body);
                            if (currentUserId !== null && notificationData.id === currentUserId) {
                                console.log("Skipping connection notification for current user's own ID.");
                                return;
                            }
                            setConnectionNotification((prev) => [
                                ...prev,
                                con.body,
                            ]);
                            setHasUnreadConnections(true);
                        } catch (error) {
                            console.error("Failed to parse connection notification JSON:", error, con.body);
                            setConnectionNotification((prev) => [
                                ...prev,
                                con.body,
                            ]);
                            setHasUnreadConnections(true);
                        }
                    }
                );

                // Subscribe to connection request notifications (existing logic)
                stompClient.subscribe(
                    "/user/queue/notifications/connectionRequest",
                    (con: IMessage) => {
                        console.log(
                            "New connection request received:",
                            con.body
                        );
                        try {
                            const requestData = JSON.parse(con.body);
                            if (currentUserId !== null && requestData.id === currentUserId) {
                                console.log("Skipping connection request notification for current user's own ID.");
                                return;
                            }
                            setConnectionRequestNotification((prev) => [
                                ...prev,
                                con.body,
                            ]);
                            setHasUnreadConnectionRequests(true);
                        } catch (error) {
                            console.error("Failed to parse connection request notification JSON:", error, con.body);
                            setConnectionRequestNotification((prev) => [
                                ...prev,
                                con.body,
                            ]);
                            setHasUnreadConnectionRequests(true);
                        }
                    }
                );
            },
            onDisconnect: () => {
                console.log("Disconnected from WebSocket");
                setIsConnected(false);
            },
            onStompError: (frame) => {
                console.error('Broker reported error: ' + frame.headers['message']);
                console.error('Additional details: ' + frame.body);
                if (client.current) {
                    client.current.deactivate();
                    setIsConnected(false);
                }
            }
        });

        stompClient.activate();
        client.current = stompClient;

        return () => {
            if (client.current) {
                console.log("Deactivating WebSocket client during cleanup.");
                client.current.deactivate();
                setIsConnected(false);
            }
        };
    }, [jwtToken, currentUserId]);

    const sendMessage = useCallback((receiverId: number, content: string) => {
        if (client.current && isConnected && currentUserId !== null) {
            const payload = {
                senderProfileId: currentUserId,
                receiverProfileId: receiverId,
                content: content,
            };

            client.current.publish({
                destination: "/app/send",
                body: JSON.stringify(payload),
            });

            console.log("Send message:", payload);

        } else {
            console.warn("WebSocket not connected or current user ID not available.");
        }
    }, [isConnected, currentUserId]);

    return (
        <WebSocketContext.Provider
            value={{
                sendMessage,
                isConnected,
                client: client.current,
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
                hasUnreadMessages, // Expose the new global flag
            }}
        >
            {children}
        </WebSocketContext.Provider>
    );
};

export const useWebSocket = () => {
    const ctx = useContext(WebSocketContext);
    if (!ctx)
        throw new Error("useWebSocket must be used within a WebSocketProvider");
    return ctx;
};