// src/components/ChatInput.tsx
import React from "react";
import { Button, Form } from "react-bootstrap";

interface ChatInputProps {
    text: string;
    setText: (text: string) => void;
    handleSend: () => void;
    isConnected: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ text, setText, handleSend, isConnected }) => {
    return (
        <div className="chat-input d-flex px-3 py-2 border-top">
            <Form.Control
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type your message"
                className="me-2"
                onKeyPress={(e) => {
                    // Send message on Enter key press (without Shift for multiline input)
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault(); // Prevent new line
                        handleSend();
                    }
                }}
                rows={1}
                as="textarea" // Use textarea for multiline input
                style={{ resize: 'none', minHeight: '38px', maxHeight: '100px' }} // Allow vertical resize within limits
            />
            <Button onClick={handleSend} disabled={!isConnected || !text.trim()}>Send</Button>
        </div>
    );
};

export default ChatInput;