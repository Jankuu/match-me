// src/context/WebSocketContext.tsx
import React, {
    createContext,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";
import SockJS from "sockjs-client";
import { Client, IMessage } from "@stomp/stompjs";

interface WebSocketContextType {
    sendMessage: (message: string) => void;
    isConnected: boolean;
    client: Client | null;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const client = useRef<Client | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const sock = new SockJS("http://localhost:8080/ws");
        const stompClient = new Client({
            webSocketFactory: () => sock,
            debug: (str) => console.log(str),
            onConnect: () => {
                console.log("✅ Connected to WebSocket");
                setIsConnected(true);

                stompClient.subscribe("/topic/messages", (msg: IMessage) => {
                    console.log("📥 Received from server:", msg.body);
                });

                stompClient.subscribe("/topic/online-users", (msg) => {
                    const onlineUsers = JSON.parse(msg.body);
                    console.log("🧍‍♀️ Online users:", onlineUsers);
                    // setState(onlineUsers) or similar
                });

                stompClient.subscribe("/topic/broadcast", (msg) => {
                    console.log("📡 Broadcast from server:", msg.body);
                    // Update UI / trigger alert / etc.
                });
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

    const sendMessage = (msg: string) => {
        if (client.current && isConnected) {
            client.current.publish({ destination: "/app/send", body: msg });
            console.log("📤 Sent to server:", msg);
        } else {
            console.warn("WebSocket not connected");
        }
        pw("11");
    };

    const pw = (msg: string) => {
        if (client.current && isConnected) {
            client.current.publish({
                destination: "/app/send",
                body: "11",
            });
            console.log("📤 Sent to server:", msg);
        } else {
            console.warn("WebSocket not connected");
        }
    };

    return (
        <WebSocketContext.Provider
            value={{ sendMessage, isConnected, client: client.current }}
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
