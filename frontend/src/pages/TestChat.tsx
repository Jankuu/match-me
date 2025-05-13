import { useState, useEffect } from "react";
import "../styles/TestChat.css";
import axios from "axios";

const TestChat = () => {
    const [id, setId] = useState<number>(0);
    const [response, setResponse] = useState<string>("");

    useEffect(() => {
        console.log(localStorage.getItem("token"));
    });

    const handleLogin = async () => {
        try {
            const res = await axios.post(
                "http://localhost:8080/auth/test/login",
                null, // No request body
                {
                    params: { id }, // Send id as query param
                }
            );
            setResponse(JSON.stringify(res.data));
        } catch (error) {
            console.error("❌ Error during test login:", error);
            setResponse("Login failed");
        }
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
        </div>
    );
};

export default TestChat;
