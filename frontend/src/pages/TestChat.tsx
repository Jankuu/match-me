import { useState, useEffect } from "react";
import "../styles/TestChat.css";
import axios from "axios";
import { useWebSocket } from "../context/WebSocketContext";

const TestChat = () => {
    const [id, setId] = useState<number>(0);
    const [response, setResponse] = useState<string>("");

    const [message, setMessage] = useState<string>("");

    const { messages } = useWebSocket();

    const { client, isConnected } = useWebSocket();

    const [receiverUsername, setReceiverUsername] = useState<string>("");

    useEffect(() => {
        if (!client || !isConnected) return;

        const subscription = client.subscribe(
            "/topic/my-custom-topic",
            (msg) => {
                console.log("📥 Received:", msg.body);
            }
        );
        return () => subscription.unsubscribe();
    }, [client, isConnected]);

    const handleLogin = async () => {
        try {
            const response = await axios.post(
                "http://localhost:8080/auth/test/login",
                null, // No request body
                {
                    params: { id }, // Send id as query param
                }
            );
            const data = response.data;
            console.log(data.token);
            // Store the JWT token in localStorage
            localStorage.setItem("token", data.token);
            setResponse(JSON.stringify(response.data));
        } catch (error) {
            console.error("❌ Error during test login:", error);
            setResponse("Login failed");
        }
    };

    const handleSendMessage = async () => {
        if (client && isConnected) {
            const formattedMessage = `@${receiverUsername} ${message}`;

            client.publish({
                destination: "/app/send",
                body: formattedMessage,
            });
            console.log("📤 Sent to server:", message);
        } else {
            console.warn("WebSocket not connected");
        }
    };

    const handleChangeReceiver = () => {
        setReceiverUsername(receiverUsername);
        console.log("Set Receiver: " + receiverUsername);
    };

    return (
        <div>
            <p>Test Chat</p>
            <input
                type="number"
                value={id}
                onChange={(e) => setId(Number(e.target.value))}
            ></input>
            <button onClick={handleLogin}>Login</button>
            <div className="reponseContainer">
                <strong>Response:</strong> {response}
            </div>

            <input
                type="text"
                value={receiverUsername}
                onChange={(e) => setReceiverUsername(e.target.value)}
            />
            <button onClick={handleChangeReceiver}>Set Receiver</button>
            <span>{receiverUsername}</span>
            <br />

            <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
            />
            <button onClick={handleSendMessage}>Send</button>

            {messages.map((msg, index) => (
                <p key={index}>{msg}</p>
            ))}
        </div>
    );
};

export default TestChat;
