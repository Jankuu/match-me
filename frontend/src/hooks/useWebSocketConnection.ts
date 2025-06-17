// src/hooks/useWebSocketConnection.ts
import { useState, useEffect, useRef, useCallback } from 'react';
import { Client, IMessage, StompHeaders } from "@stomp/stompjs";
import { ChatMessage } from '../types/ChatMessage';

/**
 * Defines the parameters for the useWebSocketConnection hook.
 */
interface UseWebSocketConnectionProps {
    jwtToken: string | null;
    currentUserId: number | null;
    onChatMessage: (message: ChatMessage, currentUserId: number | null, messageCallbacksRef: React.MutableRefObject<{ [userId: number]: (message: ChatMessage) => void }>) => void;
    onConnectionNotification: (body: string, currentUserId: number | null) => void;
    onConnectionRequestNotification: (body: string, currentUserId: number | null) => void;
    onChatDisconnectNotification: (disconnectedUserId: number) => void; // NEW: Callback for chat disconnects
    messageCallbacksRef: React.MutableRefObject<{ [userId: number]: (message: ChatMessage) => void }>;
}

/**
 * useWebSocketConnection Custom Hook
 * Manages the lifecycle of the STOMP WebSocket connection.
 * It handles connecting, disconnecting, and subscribing to core topics.
 * It dispatches incoming messages to provided handler functions.
 */
const useWebSocketConnection = ({
    jwtToken,
    currentUserId,
    onChatMessage,
    onConnectionNotification,
    onConnectionRequestNotification,
    onChatDisconnectNotification, // NEW
    messageCallbacksRef,
}: UseWebSocketConnectionProps) => {
    const client = useRef<Client | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (!jwtToken || currentUserId === null) {
            console.log("Waiting for JWT or current user ID to establish WebSocket connection.");
            if (client.current && client.current.connected) {
                console.log("Deactivating WebSocket client due to missing JWT or current user ID.");
                client.current.deactivate();
                setIsConnected(false);
            }
            return;
        }

        if (client.current && client.current.connected) {
            console.log("WebSocket client already connected with valid auth. Skipping re-activation.");
            return;
        }

        if (client.current) {
            console.log("Cleaning up previous WebSocket client instance.");
            client.current.deactivate();
        }

        const stompClient = new Client({
            brokerURL: `ws://localhost:8080/ws?token=${jwtToken}`,
            connectHeaders: {
                Authorization: `Bearer ${jwtToken}`,
            } as StompHeaders,
            debug: (str) => console.log("[STOMP]", str),
            reconnectDelay: 5000,
            onConnect: () => {
                console.log("Connected to WebSocket");
                setIsConnected(true);

                // --- Subscribe to Topics ---

                // 1. Subscribe to private chat messages for the current user
                stompClient.subscribe(
                    "/user/queue/messages",
                    (msg: IMessage) => {
                        console.log("New message received:", msg.body);
                        try {
                            const messageObj: ChatMessage = JSON.parse(msg.body);
                            onChatMessage(messageObj, currentUserId, messageCallbacksRef);
                        } catch (error) {
                            console.error("Failed to parse chat message JSON:", error, msg.body);
                        }
                    }
                );

                // 2. Subscribe to connection notifications (e.g., when a new user connects)
                stompClient.subscribe(
                    "/user/queue/notifications/connection",
                    (con: IMessage) => {
                        console.log("New connection notification received:", con.body);
                        onConnectionNotification(con.body, currentUserId);
                    }
                );

                // 3. Subscribe to connection request notifications (e.g., a friend request)
                stompClient.subscribe(
                    "/user/queue/notifications/connectionRequest",
                    (req: IMessage) => {
                        console.log("New connection request received:", req.body);
                        onConnectionRequestNotification(req.body, currentUserId);
                    }
                );

                // 4. NEW: Subscribe to disconnect notifications
                stompClient.subscribe(
                    "/user/queue/notifications/disconnect",
                    (req: IMessage) => {
                        console.log("Disconnect notification received:", req.body);
                        try {
                            const disconnectedUserId = parseInt(req.body, 10);
                            if (!isNaN(disconnectedUserId)) {
                                onChatDisconnectNotification(disconnectedUserId); // Dispatch to handler
                            } else {
                                console.warn("Received non-numeric disconnected user ID:", req.body);
                            }
                        } catch (error) {
                            console.error("Failed to process disconnect notification:", error, req.body);
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
            },
            onWebSocketClose: (event) => {
                console.log("WebSocket closed:", event.code, event.reason);
                setIsConnected(false);
            }
        });

        stompClient.activate();
        client.current = stompClient;

        return () => {
            if (client.current && client.current.connected) {
                console.log("Deactivating WebSocket client during cleanup.");
                client.current.deactivate();
                setIsConnected(false);
            }
        };
    }, [
        jwtToken,
        currentUserId,
        onChatMessage,
        onConnectionNotification,
        onConnectionRequestNotification,
        onChatDisconnectNotification, // NEW dependency
        messageCallbacksRef
    ]);

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

            console.log("Message sent:", payload);
        } else {
            console.warn("WebSocket not connected or current user ID not available. Cannot send message.");
        }
    }, [isConnected, currentUserId]);

    return { client: client.current, isConnected, sendMessage };
};

export default useWebSocketConnection;