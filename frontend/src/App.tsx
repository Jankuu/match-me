import "./App.css";
import { useState } from "react";

import { useWebSocket } from "./WebSocketContext";

function App() {
    const { sendMessage, isConnected } = useWebSocket();
    const [text, setText] = useState("");

    const handleSend = () => {
        sendMessage(text);
        setText("");
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
