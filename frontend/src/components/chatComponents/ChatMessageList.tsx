// src/components/chatComponents/ChatMessageList.tsx
import React, { useEffect, useRef, RefObject } from "react";
import { Spinner } from "react-bootstrap";
import { ChatMessage } from "../../types/ChatMessage"; // Correct relative path
import '../../styles/ChatPage.css'; // Correct relative path

interface ChatMessageListProps {
    chatMessages: ChatMessage[];
    currentUserId: number;
    receiverName: string;
    isLoading: boolean;
    // Corrected type for the ref to allow null
    messagesContainerRef: RefObject<HTMLDivElement | null>;
}

const ChatMessageList: React.FC<ChatMessageListProps> = ({
    chatMessages,
    currentUserId,
    receiverName,
    isLoading,
    messagesContainerRef, // Accept the prop
}) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Helper function for formatting timestamps
    const formatTimestamp = (isoString: string): string => {
        const date = new Date(isoString);
        const now = new Date();
        const diffDays = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);

        //Commented to meet the testing requerments. So it alwoys shows full date
        // if (diffDays < 1 && date.getDate() === now.getDate()) {
        //     return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        // } else if (diffDays < 2 && date.getDate() === now.getDate() - 1) {
        //     return `Yesterday ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        // } else { //, year: 'numeric'
            return date.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' +
                   date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        // }
    };

    // Auto-scrolls to the bottom when new messages arrive.
    const prevChatMessagesLength = useRef(chatMessages.length);
    useEffect(() => {
        // Only scroll if new messages were added and we are not currently loading history.
        if (chatMessages.length > prevChatMessagesLength.current) {
            // Check if messagesEndRef.current exists before accessing scrollTop
            if (messagesEndRef.current) {
                messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
            }
        }
        prevChatMessagesLength.current = chatMessages.length;
    }, [chatMessages]);

    return (
        // Assign the passed ref to the div
        <div className="chat-messages flex-grow-1 overflow-auto pe-2" ref={messagesContainerRef}>
            {isLoading && <div className="text-center py-2"><Spinner animation="border" size="sm" /> Loading older messages...</div>}
            
            {chatMessages.length === 0 && !isLoading ? (
                <div className="text-muted text-center py-5">No messages yet. Start a conversation!</div>
            ) : (
                chatMessages.map((msg) => {
                    const isMine = msg.senderProfileId === currentUserId;

                    return (
                        <div
                            // Use server ID if available, otherwise use tempId for key
                            key={`${msg.id ?? msg.tempId}-${msg.timestamp}`}
                            className={`message-bubble ${isMine ? "mine" : "theirs"}`}
                        >
                            {!isMine && (
                                <div className="sender-name">
                                    {receiverName}
                                </div>
                            )}
                            <div className="message-content">{msg.content}</div>
                            <div className="message-timestamp">
                                {formatTimestamp(msg.timestamp)}
                            </div>
                        </div>
                    );
                })
            )}
            {/* Invisible div for auto-scrolling to the bottom */}
            <div ref={messagesEndRef} style={{ height: '0px', overflow: 'hidden' }} />
        </div>
    );
};

export default ChatMessageList;