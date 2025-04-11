import "./App.css";
import { useEffect, useState } from "react";

import { useWebSocket } from "./WebSocketContext";
import { Client } from "@stomp/stompjs";

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
        if (client && isConnected) {
            client.publish({
                destination: "/app/send",
                body: "11",
            });
            console.log("📤 Sent to server:", "11");
        } else {
            console.warn("WebSocket not connected");
        }
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
        </div>
    );
}

export default App;
