import "./App.css";
import { useEffect, useState } from "react";

import { useWebSocket } from "./WebSocketContext";
import CreateUserForm from "./Components/CreateUserForm";

function App() {
    const { client, isConnected } = useWebSocket();

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

    const [text, setText] = useState("");

    const handleSend = () => {
        if (client && isConnected) {
            client.publish({ destination: "/app/send", body: text });
            console.log("📤 Sent to server:", text);
        } else {
            console.warn("WebSocket not connected");
        }
        setText("");
    };

    const getAllUsersInDB = async () => {
        const res = await fetch("http://localhost:8080/users/users");
        const data = await res.json();
        console.log("Got all users: ");
        console.log(data);
    };

    return (
        <div>
            <input value={text} onChange={(e) => setText(e.target.value)} />
            <button
                onClick={handleSend}
                disabled={!isConnected || !text.trim()}
            >
                Send
            </button>
            <br />
            <button onClick={getAllUsersInDB}>Get Online Users</button>
            <br />
            <CreateUserForm />
        </div>
    );
}

export default App;
