import React, {
    createContext,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";
import SockJS from "sockjs-client";
import { Client, IMessage } from "@stomp/stompjs";
import { MessageDTO } from "../types/MessageDTO";

interface WebSocketContextType {
    sendMessage: (message: MessageDTO) => void;
    isConnected: boolean;
    client: Client | null;
    messages: MessageDTO[];
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const client = useRef<Client | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [messages, setMessages] = useState<MessageDTO[]>([]);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const sock = new SockJS(`http://localhost:8080/ws?token=${token}`);
        const stompClient = new Client({
            webSocketFactory: () => sock,
            debug: (str) => console.log(str),
            connectHeaders: {
                Authorization: `Bearer ${token}`,
            },
            onConnect: () => {
                console.log("✅ Connected to WebSocket");
                setIsConnected(true);

                stompClient.subscribe("/topic/testReceiveMessage", (msg: IMessage) => {
                    try {
                        const received: MessageDTO = JSON.parse(msg.body);
                        console.log("📥 Received:", received);
                        setMessages((prev) => [...prev, received]);
                    } catch (err) {
                        console.error("❌ Error parsing message:", err);
                    }
                });

                // Отправка имени при подключении
                const username = localStorage.getItem("user.username");
                if (username) {
                    stompClient.publish({
                        destination: "/app/register",
                        body: username,
                    });
                }
            },
            onDisconnect: () => {
                console.log("❌ Disconnected from WebSocket");
                setIsConnected(false);
            },
        });

        stompClient.activate();
        client.current = stompClient;

        return () => {
            stompClient.deactivate();
        };
    }, []);

    const sendMessage = (message: MessageDTO) => {
        if (client.current && isConnected) {
            const body = JSON.stringify(message);
            client.current.publish({
                destination: "/app/testSendMessage",
                body,
            });
            setMessages((prev) => [...prev, message]); // оптимистичное добавление
            console.log("📤 Sent:", message);
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
