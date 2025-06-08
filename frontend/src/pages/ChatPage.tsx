import React, { useEffect, useState, useCallback, useRef } from "react";
import { useWebSocket } from "../context/WebSocketContext";
import { Container, Button, Form } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "react-bootstrap-icons";
import apiClient from "../utils/apiClient"; // Assuming you have an apiClient for REST calls
import { Message } from "../types/Message"; // Ensure this type matches your backend's message structure
import '../styles/ChatPage.css';

// Type for backend's message structure (adjust if yours is different)
// Assuming Message type is { id: number; senderProfileId: number; receiverProfileId: number; content: string; timestamp: string; }
// Based on the backend, the message payload might just be a string.
// Let's refine `Message` type in `src/types/Message.ts` to be more explicit.
// For now, let's assume the backend for `/user/queue/messages` sends a JSON like:
// { "senderProfileId": 123, "receiverProfileId": 456, "content": "Hello", "timestamp": "2023-10-27T10:00:00Z" }
// And the `Message` type should reflect this.
// If your backend only sends plain strings, we'll need to adapt.
// From `TestChat.tsx`'s `messages.map` logic: `const match = msg.match(/^@(\S+)\s(.+)/);`
// This suggests initial messages were just strings like "@username content".
// However, the `WebSocketContext` now parses `JSON.parse(msg.body)`, so `Message` should be an object.

// Let's assume your Message type in types/Message.ts is:
// export interface Message {
//     id?: number; // Optional if not provided by socket messages directly
//     senderProfileId: number;
//     receiverProfileId: number;
//     content: string;
//     timestamp: string; // ISO string
// }


const ChatPage: React.FC = () => {
    const { id, name } = useParams<{ id: string; name: string }>();

    const receiverId = Number(id);
    const receiverName = name || "unknown";

    // Retrieve current user data from local storage
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    const currentUserId = userData?.id || userData?.profile?.id; // Assuming ID can be at root or nested under 'profile'
    const currentUsername = userData?.username || "You"; // Assuming username can be at root or nested under 'profile'

    const { sendMessage, isConnected, registerMessageCallback, markMessagesAsReadForUser } = useWebSocket();

    const [chatMessages, setChatMessages] = useState<Message[]>([]); // State for messages in THIS specific chat
    const [text, setText] = useState("");
    const navigate = useNavigate();
    const messagesEndRef = useRef<HTMLDivElement>(null); // Ref for auto-scrolling

    // Callback to add new real-time messages to the chat
    const handleIncomingMessage = useCallback((message: Message) => {
        // Only add messages relevant to this chat conversation
        console.log(message);
        if (
            (message.senderProfileId === receiverId && message.receiverProfileId === currentUserId) ||
            (message.senderProfileId === currentUserId && message.receiverProfileId === receiverId)
        ) {
            setChatMessages((prev) => [...prev, message]);
        }
    }, [receiverId, currentUserId]);

    useEffect(() => {
        console.log("Current User ID:", currentUserId);
        console.log("Current Username:", currentUsername);
    }, [currentUserId, currentUsername]);

    // Fetch message history when the component mounts or receiverId/currentUserId changes
    useEffect(() => {
        const fetchMessageHistory = async () => {
            if (currentUserId && receiverId) {
                try {
                    // Adjust this API endpoint based on your backend for fetching chat history
                    const response = await apiClient.get<Message[]>(`/messages/history`, {
                        params: {
                            otherUserId: receiverId, // Or a combined chat ID
                            // You might also need pagination params like page=0&size=50
                        },
                    });
                    setChatMessages(response.data || []);
                    console.log("Fetched message history:", response.data);
                } catch (error) {
                    console.error("Error fetching message history:", error);
                    setChatMessages([]);
                }
            }
        };

        fetchMessageHistory();

        // Register the callback for new messages
        // This will ensure new messages are added to `chatMessages` when they arrive via WebSocket
        const cleanupCallback = registerMessageCallback(receiverId, handleIncomingMessage);

        // Mark messages for this user as read when entering the chat
        markMessagesAsReadForUser(receiverId);

        // Cleanup: remove the message callback when the component unmounts
        // Also, consider marking messages as read again if leaving the page without sending new messages
        return () => {
            cleanupCallback();
            markMessagesAsReadForUser(receiverId); // Ensure unread count is cleared when leaving
        };
    }, [receiverId, currentUserId, registerMessageCallback, markMessagesAsReadForUser, handleIncomingMessage]);


    // Auto-scroll to the bottom of the chat when new messages arrive
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
        }
    }, [chatMessages]);

    const handleSend = () => {
        if (isConnected && text.trim()) {
            sendMessage(receiverId, text);
            console.log('message sent')
            setText("");
        }
    };

    return (
        <div className="chat-page d-flex flex-column vh-100">
            <div className="chat-header px-3 pt-3 d-flex align-items-center border-bottom">
                <Button onClick={() => navigate("/matching")} className="d-flex align-items-center p-2">
                    <ArrowLeft size={20} className="me-1" /> Back
                </Button>
                <h3 className="text-center flex-grow-1 mb-0 pe-5">Chat with {receiverName}</h3>
            </div>

            <Container className="chat-body pt-2 flex-grow-1 d-flex flex-column">
                <div className="chat-messages flex-grow-1 overflow-auto pe-2" ref={messagesEndRef}>
                    {chatMessages.length === 0 ? (
                        <div className="text-muted text-center py-5">No messages yet. Start a conversation!</div>
                    ) : (
                        chatMessages.map((msg, i) => {
                            // Backend message structure is assumed to be an object now, not raw string matching
                            const isMine = msg.senderProfileId === currentUserId;

                            return (
                                <div key={i} className={`message-bubble ${isMine ? "mine" : "theirs"}`}>
                                    {!isMine && (
                                        <div className="sender-name">
                                            {/* You might want to display sender's actual name here if available */}
                                            {receiverName}
                                        </div>
                                    )}
                                    <div className="message-content">{msg.content}</div>
                                    <div className="message-timestamp">
                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </Container>

            <div className="chat-input d-flex px-3 py-2 border-top">
                <Form.Control
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Type your message"
                    className="me-2"
                    onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault(); // Prevent new line in textarea
                            handleSend();
                        }
                    }}
                />
                <Button onClick={handleSend} disabled={!isConnected || !text.trim()}>Send</Button>
            </div>
        </div>
    );
};

export default ChatPage;