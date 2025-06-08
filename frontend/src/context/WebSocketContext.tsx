import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";
import { Client, IMessage } from "@stomp/stompjs";
import { Message } from "../types/Message"; // Assuming Message type is { senderId: number; receiverId: number; content: string; timestamp: string; } or similar

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

    // NEW: Unread message counts per user
    unreadMessages: UnreadMessagesMap;
    markMessagesAsReadForUser: (userId: number) => void;
    // NEW: Callback to notify specific components about new messages
    registerMessageCallback: (userId: number, callback: (message: Message) => void) => () => void;

    refreshAuthData: () => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const client = useRef<Client | null>(null);

    const [isConnected, setIsConnected] = useState(false);
    // REMOVED: [messages, setMessages] - messages will now be managed per chat on ChatPage
    const [connectionNotification, setConnectionNotification] = useState<
        string[]
    >([]);
    const [connectionRequestNotification, setConnectionRequestNotification] =
        useState<string[]>([]);

    const [hasUnreadConnections, setHasUnreadConnections] = useState(false);
    const [hasUnreadConnectionRequests, setHasUnreadConnectionRequests] =
        useState(false);

    // NEW: State for unread message counts per user
    const [unreadMessages, setUnreadMessages] = useState<UnreadMessagesMap>({});

    const [currentUserId, setCurrentUserId] = useState<number | null>(null);
    const [jwtToken, setJwtToken] = useState<string | null>(null);

    // NEW: Ref to store message callbacks for active chat pages
    const messageCallbacks = useRef<{ [userId: number]: (message: Message) => void }>({});

    // Register a callback for a specific user's chat messages
    const registerMessageCallback = useCallback((userId: number, callback: (message: Message) => void) => {
        messageCallbacks.current[userId] = callback;
        // Return a cleanup function to remove the callback when the component unmounts
        return () => {
            delete messageCallbacks.current[userId];
        };
    }, []);

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

    // NEW: Mark messages as read for a specific user
    const markMessagesAsReadForUser = useCallback((userId: number) => {
        setUnreadMessages((prev) => {
            const newState = { ...prev };
            delete newState[userId]; // Remove the unread count for this user
            return newState;
        });
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
                            const messageObj: Message = JSON.parse(msg.body);
                            // Determine the sender ID for unread counts
                            // If the message is from me, it means the other user sent it to me
                            // If the message is to me, it means the other user sent it to me
                            // The backend message format for /user/queue/messages is important here.
                            // Assuming 'senderProfileId' is the ID of the user who sent the message
                            // and 'receiverProfileId' is the ID of the user who received it.
                            // We need to identify the 'other' user to update their unread count.
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

    const sendMessage = useCallback((receiverId: number, content: string) => { // Renamed 'message' to 'content' for clarity
        if (client.current && isConnected && currentUserId !== null) {
            const payload = {
                senderProfileId: currentUserId, // Add sender ID to payload
                receiverProfileId: receiverId,
                content: content,
                // Assuming timestamp is generated on the backend or not strictly needed for real-time display
            };

            client.current.publish({
                destination: "/app/send",
                body: JSON.stringify(payload),
            });

            console.log("Send message:", payload);

            // Optimistically add sent message to local state
            // This assumes the backend echoes the message back to the sender
            // If not, you might need to add it directly to ChatPage's local state here
            // For now, ChatPage will fetch history and rely on its own state updates.

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
                // messages, // REMOVED
                connectionNotification,
                connectionRequestNotification,
                hasUnreadConnections,
                hasUnreadConnectionRequests,
                markAllNotificationsAsRead,
                markConnectionRequestsAsRead,
                markConnectionsAsRead,
                unreadMessages, // NEW
                markMessagesAsReadForUser, // NEW
                registerMessageCallback, // NEW
                refreshAuthData,
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