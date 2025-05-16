import { useEffect, useState } from "react";
import { useWebSocket } from "../context/WebSocketContext";
import { Container, Button, Form } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "react-bootstrap-icons";
import '../styles/ChatPage.css';

type MessageDTO = {
    sender: string;
    receiver: string;
    content: string;
    timestamp?: string;
};

const ChatPage = () => {
    const { userId } = useParams<{ userId: string }>();
    const { username } = useParams<{ username: string }>();
    const { sendMessage, messages, isConnected } = useWebSocket();

    const [text, setText] = useState("");
    const navigate = useNavigate();
    const currentUsername = localStorage.getItem("user.username") || "me";

    const handleSend = () => {
        if (isConnected && text.trim()) {
            const messageDTO: MessageDTO = {
                sender: currentUsername,
                receiver: username!,
                content: text,
            };
            sendMessage(messageDTO);
            setText("");
        }
    };

    return (
        <div className="chat-page">
            <div className="chat-header px-3 pt-3">
                <Button onClick={() => navigate("/matching")} className="d-flex align-items-center">
                    <ArrowLeft size={20} className="me-1" />
                </Button>
            </div>

            <Container className="chat-body pt-2 flex-grow-1 d-flex flex-column">
                <h3 className="text-center mb-3">Chat with {username}</h3>

                <div className="chat-messages flex-grow-1">
                    {messages.length === 0 ? (
                        <div className="text-muted text-center">No messages</div>
                    ) : (
                        messages.map((msg: MessageDTO, i: number) => {
                            const isMine = msg.sender === currentUsername;
                            return (
                                <div
                                    key={i}
                                    className={`message-bubble ${isMine ? "mine" : "theirs"}`}
                                >
                                    <div className="sender-name">{msg.sender}</div>
                                    <div className="message-content">{msg.content}</div>
                                </div>
                            );
                        })
                    )}
                </div>
            </Container>

            <div className="chat-input d-flex px-3 py-2 bg-white border-top">
                <Form.Control
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Type your message"
                    className="me-2"
                />
                <Button onClick={handleSend}>Send</Button>
            </div>
        </div>
    );
};

export default ChatPage;
