import { useEffect, useState } from "react";
import { useWebSocket } from "../context/WebSocketContext";
import { Container, Button, Form } from "react-bootstrap";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "react-bootstrap-icons";
import "../styles/ChatPage.css";
import apiClient from "../utils/apiClient";
import { UserProfile } from "../types/UserProfile";

const ChatPage = () => {
    const { id, name } = useParams<{ id: string; name: string }>();
    const location = useLocation();
    const otherUserProfile = location.state?.otherUserProfile as UserProfile;

    const receiverId = Number(id);
    const receiverName = name || "unknown";
    const currentName =
        JSON.parse(localStorage.getItem("user") || "{}")?.profile.name || "me";

    const currentProfile = JSON.parse(
        localStorage.getItem("user") || "{}"
    )?.profile;

    const { sendMessage, messages, setLoadedMessages, isConnected } =
        useWebSocket();

    const [text, setText] = useState("");
    const navigate = useNavigate();

    const [page, setPage] = useState(0);
    const [size, setSize] = useState(10);

    const handleSend = () => {
        if (isConnected && text.trim()) {
            sendMessage(receiverId, text);
            setText("");
        }
    };

    useEffect(() => {
        const fetchChatLog = async () => {
            try {
                const res = await apiClient.get(
                    `/messages?otherUserProfileId=${receiverId}&page=${page}&size=${size}`
                );
                console.log(res.data.content);
                setLoadedMessages(res.data.content);
            } catch (error) {
                console.error("Failed to fetch messages", error);
            }
        };
        fetchChatLog();
    }, []);

    useEffect(() => {
        const el = document.querySelector(".chat-messages");
        if (el) el.scrollTop = el.scrollHeight;
    }, [messages]);

    return (
        <div className="chat-page">
            <div className="chat-header px-3 pt-3">
                <Button
                    onClick={() => navigate("/matching")}
                    className="d-flex align-items-center"
                >
                    <ArrowLeft size={20} className="me-1" />
                </Button>
            </div>

            <Container className="chat-body pt-2 flex-grow-1 d-flex flex-column">
                <h3 className="text-center mb-3">Chat with {receiverName}</h3>

                <div className="chat-messages flex-grow-1">
                    {messages.length === 0 ? (
                        <div className="text-muted text-center">
                            No messages
                        </div>
                    ) : (
                        messages.map((msg, i) => {
                            const senderName =
                                msg.senderProfileId === currentProfile.id
                                    ? currentProfile.name
                                    : otherUserProfile.name;

                            const isMine = senderName === currentName;
                            return (
                                <div
                                    key={i}
                                    className={`message-bubble ${
                                        isMine ? "mine" : "theirs"
                                    }`}
                                >
                                    {!isMine && (
                                        <div className="messageContainer otherMessage">
                                            <p className="timeStamp">
                                                {msg.timestamp}
                                            </p>
                                            {msg.content}
                                        </div>
                                    )}
                                    {isMine && (
                                        <div className="messageContainer myMessage">
                                            <p className="timeStamp">
                                                {msg.timestamp}
                                            </p>
                                            {msg.content}
                                        </div>
                                    )}
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
                />
                <Button onClick={handleSend}>Send</Button>
            </div>
        </div>
    );
};

export default ChatPage;
