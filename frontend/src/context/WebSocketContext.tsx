import React, {
    createContext,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";
import { Client, IMessage } from "@stomp/stompjs";

interface WebSocketContextType {
    sendMessage: (receiverId: number, message: string) => void;
    isConnected: boolean;
    client: Client | null;
    messages: string[];
    connectionNotification: string[];
    connectionRequestNotification: string[];
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const client = useRef<Client | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [messages, setMessages] = useState<string[]>([]);
    const [connectionNotification, setConnectionNotification] = useState<
        string[]
    >([]);
    const [connectionRequestNotification, setConnectionRequestNotification] =
        useState<string[]>([]);

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

                stompClient.subscribe(
                    "/user/queue/messages",
                    (msg: IMessage) => {
                        console.log("New message:", msg.body);
                        setMessages((prev) => [...prev, msg.body]);
                    }
                );

                stompClient.subscribe(
                    "/user/queue/notifications/connection",
                    (con: IMessage) => {
                        console.log("New connection:", con.body);
                        setConnectionNotification((prev) => [
                            ...prev,
                            con.body,
                        ]);
                    }
                );

                stompClient.subscribe(
                    "/user/queue/notifications/connectionRequest",
                    (con: IMessage) => {
                        console.log("New connection request:", con.body);
                        setConnectionRequestNotification((prev) => [
                            ...prev,
                            con.body,
                        ]);
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
            const payload = {
                receiverProfileId: receiverId,
                content: message,
            };

            client.current.publish({
                destination: "/app/send",
                body: JSON.stringify(payload),
            });

            console.log("Send message:", payload);
        } else {
            console.warn("WebSocket not connected");
        }
        /*if (client.current && isConnected) {
            const formattedMessage = `@${receiverId} ${message}`;

            client.current.publish({
                destination: "/app/send",
                body: formattedMessage,
            });

            console.log("Send message:", formattedMessage);
        } else {
            console.warn("WebSocket not connected");
        }*/
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
