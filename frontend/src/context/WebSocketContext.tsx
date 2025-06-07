import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";
import { Client, IMessage } from "@stomp/stompjs"; // Import STOMP client for WebSocket communication
import { Message } from "../types/Message"; // Import type definition for messages

/**
 * Defines the shape of the WebSocket context.
 * This interface specifies all the values and functions that will be
 * exposed by the WebSocketProvider to its consumers.
 */
interface WebSocketContextType {
    sendMessage: (receiverId: number, message: string) => void; // Function to send a message
    isConnected: boolean; // Boolean indicating if the WebSocket is currently connected
    client: Client | null; // The STOMP client instance (can be null before connection)
    messages: Message[]; // Array of received chat messages
    connectionNotification: string[]; // Array of raw notifications about connection status changes (e.g., "accepted", "rejected")
    connectionRequestNotification: string[]; // Array of raw notifications about new incoming connection requests
    hasUnreadConnections: boolean; // Flag to indicate if there are new unread connection status notifications
    hasUnreadConnectionRequests: boolean; // Flag to indicate if there are new unread connection request notifications
    markAllNotificationsAsRead: () => void; // Function to clear both unread flags
    markConnectionRequestsAsRead: () => void; // Function to clear only the connection request unread flag
    markConnectionsAsRead: () => void; // Function to clear only the connection status unread flag
}

// Create the React Context.
// This will be used by the provider to pass down values and by consumers to access them.
const WebSocketContext = createContext<WebSocketContextType | null>(null);

/**
 * WebSocketProvider component.
 * This component sets up and manages the WebSocket connection using @stomp/stompjs.
 * It provides WebSocket-related state and functions to its children components via context.
 */
export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    // useRef to hold the STOMP client instance.
    // useRef is used here because the client object itself doesn't trigger re-renders
    // when it changes, and it persists across renders.
    const client = useRef<Client | null>(null);

    // useState for connection status.
    const [isConnected, setIsConnected] = useState(false);
    // useState for chat messages.
    const [messages, setMessages] = useState<Message[]>([]);
    // useState for connection status notifications (e.g., connection accepted/rejected).
    const [connectionNotification, setConnectionNotification] = useState<
        string[]
    >([]);
    // useState for incoming connection request notifications.
    const [connectionRequestNotification, setConnectionRequestNotification] =
        useState<string[]>([]);

    // useState for unread flags (derived state for UI indication).
    const [hasUnreadConnections, setHasUnreadConnections] = useState(false);
    const [hasUnreadConnectionRequests, setHasUnreadConnectionRequests] =
        useState(false);

    // useEffect to update hasUnreadConnections flag when connectionNotification array changes.
    // If there's any notification, set the flag to true.
    useEffect(() => {
        if (connectionNotification.length > 0) {
            setHasUnreadConnections(true);
        }
    }, [connectionNotification]);

    // useEffect to update hasUnreadConnectionRequests flag when connectionRequestNotification array changes.
    // If there's any request notification, set the flag to true.
    useEffect(() => {
        if (connectionRequestNotification.length > 0) {
            setHasUnreadConnectionRequests(true);
        }
    }, [connectionRequestNotification]);

    /**
     * Callback function to mark all types of notifications as read.
     * Resets both hasUnreadConnections and hasUnreadConnectionRequests flags to false.
     * Optionally, you could clear the underlying notification arrays here too if desired.
     */
    const markAllNotificationsAsRead = useCallback(() => {
        setHasUnreadConnections(false);
        setHasUnreadConnectionRequests(false);
        // Optionally, clear the raw notification arrays if you want to reset them
        // setConnectionNotification([]);
        // setConnectionRequestNotification([]);
    }, []); // Empty dependency array means this function is created once

    /**
     * Callback function to mark only connection request notifications as read.
     * Resets hasUnreadConnectionRequests flag to false.
     */
    const markConnectionRequestsAsRead = useCallback(() => {
        setHasUnreadConnectionRequests(false);
        // setConnectionRequestNotification([]); // Clear raw requests if desired
    }, []);

    /**
     * Callback function to mark only connection status notifications as read.
     * Resets hasUnreadConnections flag to false.
     */
    const markConnectionsAsRead = useCallback(() => {
        setHasUnreadConnections(false);
        // setConnectionNotification([]); // Clear raw connections if desired
    }, []);

    /**
     * useEffect hook to handle WebSocket connection lifecycle.
     * This runs once on component mount and cleans up on unmount.
     */
    useEffect(() => {
        // Retrieve JWT token from localStorage.
        const token = localStorage.getItem("token");
        if (token == null) {
            console.log("JWT is null"); // Log if token is missing (connection will likely fail)
            // Consider more robust error handling or user redirection here
        }

        // Create a new STOMP client instance.
        const stompClient = new Client({
            // WebSocket broker URL, including the JWT token as a query parameter for authentication.
            brokerURL: `ws://localhost:8080/ws?token=${token}`,
            // Custom headers for connection, also including Authorization for security.
            connectHeaders: {
                Authorization: `Bearer ${token}`,
            },
            // Enable debug logging for STOMP client.
            debug: (str) => console.log("[STOMP]", str),
            // Reconnection delay in milliseconds if connection is lost.
            reconnectDelay: 5000,
            // Callback function executed when the STOMP client successfully connects.
            onConnect: () => {
                console.log("Connected to WebSocket");
                setIsConnected(true); // Update connection status state

                // Subscribe to the private message queue for the current user.
                // Messages sent to /app/send will be routed here by the server.
                stompClient.subscribe(
                    "/user/queue/messages",
                    (msg: IMessage) => {
                        console.log("New message:", msg.body);
                        // Parse the message body and add it to the messages state.
                        const messageObj: Message = JSON.parse(msg.body);
                        setMessages((prev) => [...prev, messageObj]);
                    }
                );

                // Subscribe to the connection notification queue.
                // This queue receives updates about connections (e.g., another user accepting/rejecting a request).
                stompClient.subscribe(
                    "/user/queue/notifications/connection",
                    (con: IMessage) => {
                        console.log("New connection:", con.body);
                        setConnectionNotification((prev) => [
                            ...prev,
                            con.body,
                        ]);
                        setHasUnreadConnections(true); // Set unread flag for UI
                    }
                );

                // Subscribe to the connection request notification queue.
                // This queue receives notifications when other users send connection requests to the current user.
                stompClient.subscribe(
                    "/user/queue/notifications/connectionRequest",
                    (con: IMessage) => {
                        console.log(
                            "New connection request received:",
                            con.body
                        );
                        setConnectionRequestNotification((prev) => [
                            ...prev,
                            con.body,
                        ]);
                        setHasUnreadConnectionRequests(true); // Set unread flag for UI
                    }
                );
            },
            // Callback function executed when the STOMP client disconnects.
            onDisconnect: () => {
                console.log("Disconnected from WebSocket");
                setIsConnected(false); // Update connection status state
            },
        });

        // Activate the STOMP client to establish connection.
        stompClient.activate();
        // Store the active client in the useRef for later use (e.g., sending messages).
        client.current = stompClient;

        // Cleanup function for useEffect.
        // This will be called when the component unmounts.
        return () => {
            stompClient.deactivate(); // Disconnect the STOMP client
        };
    }, []); // Empty dependency array ensures this effect runs only once on mount

    /**
     * Function to send a chat message to a specific receiver.
     * @param receiverId The ID of the recipient's profile.
     * @param message The content of the message.
     */
    const sendMessage = (receiverId: number, message: string) => {
        // Check if the client is initialized and connected before sending.
        if (client.current && isConnected) {
            const payload = {
                receiverProfileId: receiverId,
                content: message,
            };

            // Publish (send) the message to the STOMP destination.
            // The Spring backend will process this and route it to the correct user.
            client.current.publish({
                destination: "/app/send", // STOMP destination for sending messages
                body: JSON.stringify(payload), // Message payload as a JSON string
            });

            console.log("Send message:", payload);
        } else {
            console.warn("WebSocket not connected"); // Warn if trying to send while disconnected
        }
    };

    return (
        // Provide the WebSocket context values to all children components.
        <WebSocketContext.Provider
            value={{
                sendMessage,
                isConnected,
                client: client.current, // Expose the STOMP client instance
                messages,
                connectionNotification,
                connectionRequestNotification,
                hasUnreadConnections,
                hasUnreadConnectionRequests,
                markAllNotificationsAsRead,
                markConnectionRequestsAsRead,
                markConnectionsAsRead,
            }}
        >
            {children} {/* Render child components that consume this context */}
        </WebSocketContext.Provider>
    );
};

/**
 * Custom hook to easily consume the WebSocket context.
 * Throws an error if used outside of a WebSocketProvider.
 */
export const useWebSocket = () => {
    const ctx = useContext(WebSocketContext);
    if (!ctx)
        throw new Error("useWebSocket must be used within a WebSocketProvider");
    return ctx;
};