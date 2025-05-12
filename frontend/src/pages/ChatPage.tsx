import { useEffect, useState } from "react";
import { useWebSocket } from "../context/WebSocketContext";
import { Container, Button, Form } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "react-bootstrap-icons";
// import { useNavigate } from "react-router-dom";

const ChatPage = () => {
    const { userId } = useParams<{ userId: string }>(); //Use it for connection
    const { username } = useParams<{ username: string }>();
    const { sendMessage, messages, isConnected } = useWebSocket();
    // const { client, isConnected } = useWebSocket();
    const [text, setText] = useState("");
    const navigate = useNavigate();
    // const [messages, setMessages] = useState<string[]>([]);


    // useEffect(() => {
    //     if (!client || !isConnected) return;

    //     const subscription = client.subscribe("/topic/my-custom-topic", (msg) => {
    //         console.log("📥 Received:", msg.body);
    //         setMessages((prev) => [...prev, msg.body]);
    //     });

    //     return () => subscription.unsubscribe();
    // }, [client, isConnected]);

    const handleSend = () => {
        if (isConnected && text.trim()) {
            sendMessage(text);
            setText("");
        }
    };

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                height: "100vh",
                paddingBottom: "60px",
            }}
        >
            <div className="px-3 pt-3">
                <Button
                    // variant="link"
                    onClick={() => navigate("/matching")}
                    className="d-flex align-items-center"
                >
                    <ArrowLeft size={20} className="me-1" />
                    {/* Back */}
                </Button>
            </div>
    
            <Container className="pt-2 flex-grow-1 d-flex flex-column">
                <h3>Chat with {username}</h3>
    
                <div
                    className="flex-grow-1"
                    style={{
                        overflowY: "auto",
                        paddingBottom: "1rem",
                        marginTop: "1rem",
                    }}
                >
                    {messages.length === 0 ? (
                        <div className="text-muted text-center">No messages</div>
                    ) : (
                        messages.map((msg, i) => <div key={i}>💬 {msg}</div>)
                    )}
                </div>
            </Container>
    
            <div
                className="d-flex px-3 py-2 bg-white border-top"
                style={{
                    position: "sticky",
                    bottom: 0,
                    zIndex: 1030,
                }}
            >
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
}

export default ChatPage;
