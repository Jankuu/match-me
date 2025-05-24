import { useEffect, useState } from "react";
import { useWebSocket } from "../context/WebSocketContext";
import { Container, Button, Form } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "react-bootstrap-icons";
import '../styles/ChatPage.css';

const ChatPage = () => {
    const { receiverName } = useParams<{ receiverName: string }>();
    const currentUsername = JSON.parse(localStorage.getItem("user") || "{}")?.username || "me";
  
    const { sendMessage, messages, isConnected } = useWebSocket();
  
    const [text, setText] = useState("");
    const navigate = useNavigate();
  
    const handleSend = () => {
      if (isConnected && text.trim()) {
        sendMessage(receiverName!, text);
        setText("");
      }
    };

    useEffect(() => {
        const el = document.querySelector(".chat-messages");
        if (el) el.scrollTop = el.scrollHeight;
      }, [messages]);

    return (
        <div className="chat-page">
            <div className="chat-header px-3 pt-3">
                <Button onClick={() => navigate("/matching")} className="d-flex align-items-center">
                    <ArrowLeft size={20} className="me-1" />
                </Button>
            </div>

            <Container className="chat-body pt-2 flex-grow-1 d-flex flex-column">
                <h3 className="text-center mb-3">Chat with {receiverName}</h3>

                <div className="chat-messages flex-grow-1">
          {messages.length === 0 ? (
            <div className="text-muted text-center">No messages</div>
          ) : (
            messages.map((msg, i) => {
              const match = msg.match(/^@(\S+)\s(.+)/);
              const senderUsername = match ? match[1] : "unknown";
              const content = match ? match[2] : msg;

              const isMine = senderUsername === currentUsername;

              return (
                <div key={i} className={`message-bubble ${isMine ? "mine" : "theirs"}`}>
                  {!isMine && <div className="sender-name">{senderUsername}</div>}
                  <div className="message-content">{content}</div>
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
