import React, { useEffect } from "react"; // Add useEffect
import { Container } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom"; // Add useNavigate
import ChatMessageList from "../components/chatComponents/ChatMessageList";
import ChatInput from "../components/chatComponents/ChatInput";
import ChatHeader from "../components/chatComponents/ChatHeader";
import useChatLogic from "../hooks/useChatLogic";
import { useWebSocket } from "../providers/WebSocketProvider"; // Import useWebSocket hook
import "../styles/ChatPage.css";

const ChatPage: React.FC = () => {
    const { id, name } = useParams<{ id: string; name: string }>();
    const navigate = useNavigate(); // Initialize useNavigate

    const receiverId = Number(id);
    const receiverName = name || "unknown";

    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    const currentUserId = Number(userData?.id || userData?.profile?.id);
    // const currentUsername = userData?.username || "You"; // Not used in this file

    // Use the custom hook for chat logic and state
    const {
        chatMessages,
        text,
        setText,
        handleSend,
        messagesContainerRef,
        isConnected,
    } = useChatLogic({ receiverId, currentUserId });

    // Use the custom hook to get WebSocket-related states and functions
    const { disconnectedChatUsers, clearDisconnectedChatUser } = useWebSocket();

    // Effect to handle chat partner disconnects
    useEffect(() => {
        // Check if the current receiver's ID is in the disconnectedChatUsers array
        if (disconnectedChatUsers.includes(receiverId)) {
            console.log(`Chat partner ${receiverId} disconnected. Navigating away.`);
            // Navigate the user to the matching page
            navigate('/matching', { replace: true });
            // Clear this specific disconnected user ID from the list
            clearDisconnectedChatUser(receiverId);
        }
    }, [disconnectedChatUsers, receiverId, navigate, clearDisconnectedChatUser]); // Add dependencies

    return (
        <div className="chat-page d-flex flex-column vh-100">
            {/* Chat Header */}
            <ChatHeader receiverName={receiverName} />

            {/* Chat Body - Messages Container */}
            <Container className="chat-body pt-2 flex-grow-1 d-flex flex-column">
                <ChatMessageList
                    chatMessages={chatMessages}
                    currentUserId={currentUserId}
                    receiverName={receiverName}
                    isLoading={false}
                    messagesContainerRef={messagesContainerRef}
                />
            </Container>

            {/* Chat Input Area */}
            <ChatInput
                text={text}
                setText={setText}
                handleSend={handleSend}
                isConnected={isConnected}
            />
        </div>
    );
};

export default ChatPage;