import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";
import { Client, IMessage } from "@stomp/stompjs";
import { Message } from "../types/Message";

interface WebSocketContextType {
    isConnected: boolean;
    client: Client | null;

    sendMessage: (receiverId: number, message: string) => void;
    messages: Message[];

    connectionNotification: string[];
    connectionRequestNotification: string[];
    hasUnreadConnections: boolean;
    hasUnreadConnectionRequests: boolean;

    markAllNotificationsAsRead: () => void;
    markConnectionRequestsAsRead: () => void;
    markConnectionsAsRead: () => void;
    // НОВАЯ ФУНКЦИЯ: для обновления данных аутентификации из localStorage
    refreshAuthData: () => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const client = useRef<Client | null>(null);

    const [isConnected, setIsConnected] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [connectionNotification, setConnectionNotification] = useState<
        string[]
    >([]);
    const [connectionRequestNotification, setConnectionRequestNotification] =
        useState<string[]>([]);

    const [hasUnreadConnections, setHasUnreadConnections] = useState(false);
    const [hasUnreadConnectionRequests, setHasUnreadConnectionRequests] =
        useState(false);

    const [currentUserId, setCurrentUserId] = useState<number | null>(null);
    const [jwtToken, setJwtToken] = useState<string | null>(null);

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

    // НОВАЯ ФУНКЦИЯ: Функция для принудительного обновления токена и ID пользователя
    const refreshAuthData = useCallback(() => {
        const token = localStorage.getItem("token");
        setJwtToken(token); // Обновляем состояние токена

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
                    setCurrentUserId(null); // Очищаем, если данные невалидны
                }
            } else {
                console.warn("User object not found in localStorage. Cannot determine current user ID for notification filtering.");
                setCurrentUserId(null); // Очищаем, если user object отсутствует
            }
        } catch (e) {
            console.error("Error parsing user data from localStorage:", e);
            setCurrentUserId(null); // Очищаем при ошибке парсинга
        }
        console.log("refreshAuthData called. New JWT State:", token ? "present" : "null", "New User ID State:", currentUserId);

    }, [currentUserId]); // Добавил currentUserId в зависимости, чтобы console.log показывал актуальное значение при вызове. Влияния на логику нет.

    // Вызываем refreshAuthData один раз при монтировании компонента.
    // Это гарантирует, что токен и ID пользователя будут загружены при старте.
    useEffect(() => {
        refreshAuthData();
    }, [refreshAuthData]); // Зависимость от refreshAuthData, чтобы гарантировать, что он будет вызван

    useEffect(() => {
        // Проверяем, что токен доступен, прежде чем пытаться подключиться
        if (jwtToken == null) {
            console.log("JWT is null, cannot establish WebSocket connection.");
            // Если клиент уже активирован (например, был логин, потом логаут), деактивируем его
            if (client.current && client.current.connected) {
                client.current.deactivate();
                setIsConnected(false);
            }
            return;
        }

        // Если currentUserId еще не загружен (или стал null), ждем его
        if (currentUserId === null) {
            console.log("Current user ID not loaded yet, waiting to establish WebSocket connection.");
            return;
        }

        // Деактивируем существующий клиент, если он есть, перед созданием нового.
        // Это важно для переподключения, когда токен обновился.
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

                stompClient.subscribe(
                    "/user/queue/messages",
                    (msg: IMessage) => {
                        console.log("New message:", msg.body);
                        const messageObj: Message = JSON.parse(msg.body);
                        setMessages((prev) => [...prev, messageObj]);
                    }
                );

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
                if (client.current) { // Не полагаемся на isConnected, просто пытаемся деактивировать
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
    }, [jwtToken, currentUserId]); // Зависимости: jwtToken и currentUserId

    const sendMessage = useCallback((receiverId: number, message: string) => {
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
    }, [isConnected]);

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
                refreshAuthData, // Предоставляем новую функцию через контекст
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