import React from "react";
import { Container } from "react-bootstrap";
import { useParams } from "react-router-dom";
import ChatMessageList from "../components/chatComponents/ChatMessageList";
import ChatInput from "../components/chatComponents/ChatInput";
import ChatHeader from "../components/chatComponents/ChatHeader"; // New import
import useChatLogic from "../hooks/useChatLogic"; // New import
import "../styles/ChatPage.css";

const ChatPage: React.FC = () => {
    const { id, name } = useParams<{ id: string; name: string }>();

    const receiverId = Number(id);
    const receiverName = name || "unknown";

    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    const currentUserId = Number(userData?.id || userData?.profile?.id);
    const currentUsername = userData?.username || "You"; // Current username is not used in this file but was in the original

    // Use the custom hook to get all chat logic and state
    const {
        chatMessages,
        text,
        setText,
        handleSend,
        isLoading,
        messagesContainerRef,
        isConnected,
    } = useChatLogic({ receiverId, currentUserId });

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
                    isLoading={isLoading}
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