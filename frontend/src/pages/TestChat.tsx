import { useState, useEffect } from "react";
import "../styles/TestChat.css";
import { useWebSocket } from "../context/WebSocketContext";
import apiClient from "../utils/apiClient";
import axios from "axios";

type Game = {
    name: string;
    value1: number;
    value2: number;
    value3: number;
    value4: number;
    value5: number;
};

const TestChat = () => {
    const { messages, sendMessage } = useWebSocket();

    const [id, setId] = useState<number>(0);
    const [response, setResponse] = useState<string>("");
    const [message, setMessage] = useState<string>("");
    const [receiverProfileId, setReceiverProfileId] = useState<number>();

    // Games
    const [games, setGames] = useState<Game[]>([]);
    const [selectedGames, setSelectedGames] = useState<Set<Game>>(new Set());

    useEffect(() => {
        axios
            .get<Game[]>("http://localhost:8080/games")
            .then((response) => {
                setGames(response.data);
            })
            .catch((error) => {
                console.error("Error fetching games:", error);
            });
    }, []);

    const toggleGame = (game: Game) => {
        setSelectedGames((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(game)) {
                newSet.delete(game);
            } else {
                newSet.add(game);
            }
            console.log(Array.from(newSet));
            return newSet;
        });
    };

    // Chatting
    const handleLogin = async () => {
        try {
            const response = await apiClient.post(
                "/auth/test/login",
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
        if (receiverProfileId === undefined) return;
        sendMessage(receiverProfileId, message);
    };

    const handleChangeReceiver = () => {
        setReceiverProfileId(receiverProfileId);
        console.log("Set Receiver: " + receiverProfileId);
    };

    // JWT testing
    const handleFakeRequest = async () => {
        const data = {
            interestedMinAge: 50,
        };
        const token = localStorage.getItem("token");

        try {
            const response = await axios.patch(
                `http://localhost:8080/users?id=2`,
                data, // axios auto JSON to body
                {
                    headers: {
                        "Content-Type": "application/json", // technically not needed, apparently axios does it automatically
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            // no need to check response.ok with axios
            console.log(response);
        } catch (error) {
            console.error("❌ Error during handleFakeRequest:", error);
        }
    };

    return (
        <div>
            <p>Games</p>
            <div className="scrollContainer">
                {games.map((game) => (
                    <button
                        key={game.name}
                        onClick={() => toggleGame(game)}
                        style={{
                            backgroundColor: selectedGames.has(game)
                                ? "#4caf50"
                                : "#f0f0f0",
                            color: selectedGames.has(game) ? "white" : "black",
                            border: "1px solid #ccc",
                            borderRadius: "5px",
                            cursor: "pointer",
                        }}
                        className="gameButton"
                    >
                        {game.name}
                    </button>
                ))}
            </div>

            <button onClick={handleFakeRequest}>Fake request</button>

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
                type="number"
                value={receiverProfileId ?? ""}
                onChange={(e) => setReceiverProfileId(Number(e.target.value))}
            />
            <button onClick={handleChangeReceiver}>Set Receiver</button>
            <span>{receiverProfileId}</span>
            <br />

            <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
            />
            <button onClick={handleSendMessage}>Send</button>

            {messages.map((msg, index) => (
                <div className="chatMessageContainer" key={index}>
                    <p>Sender: {msg.senderProfileId}</p>
                    <p>Message: {msg.content}</p>
                    <p>Receiver: {msg.receiverProfileId}</p>
                    <p>Read: {msg.hasReceiverRead ? "true" : "false"}</p>
                </div>
            ))}
        </div>
    );
};

export default TestChat;
