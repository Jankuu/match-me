// src/hooks/useWebSocketConnection.ts
import { useState, useEffect, useRef, useCallback } from 'react';
import { Client, IMessage } from "@stomp/stompjs";
import { ChatMessage } from '../types/ChatMessage'; // Assuming ChatMessage type is available

/**
 * Defines the parameters for the useWebSocketConnection hook.
 */
interface UseWebSocketConnectionProps {
    jwtToken: string | null;
    currentUserId: number | null;
    // Handlers for different types of incoming messages/notifications
    onChatMessage: (message: ChatMessage, currentUserId: number | null, messageCallbacksRef: React.MutableRefObject<{ [userId: number]: (message: ChatMessage) => void }>) => void;
    onConnectionNotification: (body: string, currentUserId: number | null) => void;
    onConnectionRequestNotification: (body: string, currentUserId: number | null) => void;
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
    messageCallbacksRef,
}: UseWebSocketConnectionProps) => {
    const client = useRef<Client | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    /**
     * Main effect for establishing and managing the WebSocket connection.
     * Reacts to changes in jwtToken or currentUserId.
     */
    useEffect(() => {
        // If no token or user ID, connection cannot be established or is invalid
        if (!jwtToken) {
            console.log("JWT is null, cannot establish WebSocket connection.");
            if (client.current && client.current.connected) {
                client.current.deactivate();
                setIsConnected(false);
            }
            return; // Exit if no token
        }

        if (currentUserId === null) {
            console.log("Current user ID not loaded yet, waiting to establish WebSocket connection.");
            return; // Exit if user ID is null
        }

        // If an existing client is connected, deactivate it for reconnection
        if (client.current && client.current.connected) {
            console.log("Deactivating existing WebSocket client for reconnection.");
            client.current.deactivate();
        }

        // Initialize STOMP client
        const stompClient = new Client({
            brokerURL: `ws://localhost:8080/ws?token=${jwtToken}`, // Your WebSocket endpoint
            connectHeaders: {
                Authorization: `Bearer ${jwtToken}`, // Include JWT for authentication
            },
            debug: (str) => console.log("[STOMP]", str), // Enable STOMP debug logs
            reconnectDelay: 5000, // Attempt to reconnect every 5 seconds
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
                            onChatMessage(messageObj, currentUserId, messageCallbacksRef); // Dispatch to handler
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
                        onConnectionNotification(con.body, currentUserId); // Dispatch to handler
                    }
                );

                // 3. Subscribe to connection request notifications (e.g., a friend request)
                stompClient.subscribe(
                    "/user/queue/notifications/connectionRequest",
                    (req: IMessage) => {
                        console.log("New connection request received:", req.body);
                        onConnectionRequestNotification(req.body, currentUserId); // Dispatch to handler
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
                // On STOMP error, deactivate to attempt a clean reconnect cycle
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

        // Activate the STOMP client to establish the connection
        stompClient.activate();
        client.current = stompClient; // Store the client instance in a ref

        // Cleanup function for when the component unmounts or dependencies change
        return () => {
            if (client.current && client.current.connected) {
                console.log("Deactivating WebSocket client during cleanup.");
                client.current.deactivate();
                setIsConnected(false);
            }
        };
    }, [
        jwtToken,           // Reconnect if token changes (login/logout)
        currentUserId,      // Reconnect if user ID changes
        onChatMessage,      // Stable callback from parent hook
        onConnectionNotification, // Stable callback from parent hook
        onConnectionRequestNotification, // Stable callback from parent hook
        messageCallbacksRef // Stable ref from parent hook
    ]);

    /**
     * Sends a message via the WebSocket connection.
     * Memoized for stable reference.
     * @param receiverId The ID of the recipient.
     * @param content The message content string.
     */
    const sendMessage = useCallback((receiverId: number, content: string) => {
        if (client.current && isConnected && currentUserId !== null) {
            const payload = {
                senderProfileId: currentUserId,
                receiverProfileId: receiverId,
                content: content,
            };

            client.current.publish({
                destination: "/app/send", // Your backend message sending endpoint
                body: JSON.stringify(payload),
            });

            console.log("Message sent:", payload);
        } else {
            console.warn("WebSocket not connected or current user ID not available. Cannot send message.");
        }
    }, [isConnected, currentUserId]); // Dependencies: connection status and sender ID

    return { client: client.current, isConnected, sendMessage };
};

export default useWebSocketConnection;