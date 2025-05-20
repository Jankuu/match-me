import React, {
    createContext,
    useContext,
    useEffect,
    useRef,
    useState,
    useCallback, // Add useCallback
} from "react";
import { Client, IMessage } from "@stomp/stompjs";
import { MessageDTO } from "../types/MessageDTO";

interface WebSocketContextType {
    sendMessage: (receiverId: number, message: string) => void;
    isConnected: boolean;
    client: Client | null;
    messages: string[];
    connectionNotification: string[]; // Raw connection notifications (e.g., "accepted", "rejected")
    connectionRequestNotification: string[]; // Raw new connection request notifications
    // --- NEW ---
    hasUnreadConnections: boolean; // Indicates if there are new connections (accepted/rejected)
    hasUnreadConnectionRequests: boolean; // Indicates if there are new requests
    markAllNotificationsAsRead: () => void; // Clears both types of unread flags
    markConnectionRequestsAsRead: () => void; // Clears only connection request flag
    markConnectionsAsRead: () => void; // Clears only connections flag
    // --- NEW END ---
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const client = useRef<Client | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [messages, setMessages] = useState<MessageDTO[]>([]);
    const [connectionNotification, setConnectionNotification] = useState<
        string[]
    >([]);
    const [connectionRequestNotification, setConnectionRequestNotification] =
        useState<string[]>([]);

    const [hasUnreadConnections, setHasUnreadConnections] = useState(false);
    const [hasUnreadConnectionRequests, setHasUnreadConnectionRequests] = useState(false);

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
        // Optionally, clear the raw notification arrays if you want to reset them
        // setConnectionNotification([]);
        // setConnectionRequestNotification([]);
    }, []);

    const markConnectionRequestsAsRead = useCallback(() => {
        setHasUnreadConnectionRequests(false);
        // setConnectionRequestNotification([]); // Clear raw requests if desired
    }, []);

    const markConnectionsAsRead = useCallback(() => {
        setHasUnreadConnections(false);
        // setConnectionNotification([]); // Clear raw connections if desired
    }, []);
    // --- NEW CALLBACKS END ---


    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token == null) {
            console.log("JWT is null");
        }

        const stompClient = new Client({
            brokerURL: `ws://localhost:8080/ws?token=${token}`,
            connectHeaders: {
                Authorization: `Bearer ${token}`,
            },
            debug: (str) => console.log("[STOMP]", str),
            reconnectDelay: 5000,
            onConnect: () => {
                console.log("Connected to WebSocket");
                setIsConnected(true);

                stompClient.subscribe("/user/queue/messages", (msg: IMessage) => {
                    try {
                        const parsed: MessageDTO = JSON.parse(msg.body);
                        console.log("New message:", parsed);
                        setMessages((prev) => [...prev, parsed]);
                    } catch (e) {
                        console.error("Failed to parse message", msg.body);
                    }
                });

                stompClient.subscribe(
                    "/user/queue/notifications/connection",
                    (con: IMessage) => {
                        console.log("New connection:", con.body);
                        setConnectionNotification((prev) => [
                            ...prev,
                            con.body,
                        ]);
                        setHasUnreadConnections(true); // Ensure flag is set immediately
                    }
                );

                stompClient.subscribe(
                    "/user/queue/notifications/connectionRequest",
                    (con: IMessage) => {
                        console.log("New connection request received:", con.body);
                        setConnectionRequestNotification((prev) => [
                            ...prev,
                            con.body,
                        ]);
                        setHasUnreadConnectionRequests(true); // Ensure flag is set immediately
                    }
                );
            },
            onDisconnect: () => {
                console.log("Disconnected from WebSocket");
                setIsConnected(false);
            },
        });

        stompClient.activate();
        client.current = stompClient;

        return () => {
            stompClient.deactivate();
        };
    }, []);

    const sendMessage = (receiverId: number, message: string) => {
        if (client.current && isConnected) {
            const formattedMessage = `@${receiverId} ${message}`;

            client.current.publish({
                destination: "/app/send",
                body: JSON.stringify(message),
            });
            console.log("Sent message:", message);
        } else {
            console.warn("WebSocket not connected");
        }
    };

    return (
        <WebSocketContext.Provider
            value={{
                sendMessage,
                isConnected,
                client: client.current,
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