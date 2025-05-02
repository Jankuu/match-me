import { useEffect, useState, useRef } from "react";
import { useWebSocket } from "../context/WebSocketContext";
import "../styles/TestStenPage.css";

const TestStenPage = () => {
    const { client, isConnected } = useWebSocket();
    const [messagesPage, setMessagesPage] = useState(0);
    const [loadedMessages, setLoadedMessages] = useState<any[] | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    /*
    
    user login <- Java
    getUser
    

    
    */
    useEffect(() => {
        const fetchMessages = async () => {
            const messages = await getMessages();
            if (messages === undefined) return;
            setLoadedMessages(messages.slice().reverse() || []);
        };
        fetchMessages();
    }, []);

    useEffect(() => {
        if (!client || !isConnected) return;

        const subscription = client.subscribe(
            "/topic/testReceiveMessage",
            (msg) => {
                console.log(msg.body);
            }
        );

        return () => subscription.unsubscribe();
    }, [client, isConnected]);

    const handleSendMessage = () => {
        const msg = inputRef.current?.value || "";
        let message = new MessageDTO();
        message.content = msg;
        message.receiverId = 2;
        message.senderId = 1;

        if (client && isConnected) {
            client.publish({
                destination: "/app/testSendMessage",
                body: JSON.stringify(message),
            });
        } else {
            console.warn("WebSocket not connected");
        }
    };

    return (
        <div>
            <div id="ScrollContainer">
                <div id="ScrollContent">
                    {loadedMessages?.map((message, index) => (
                        <div id="Message" key={index}>
                            <p id="Sender">Sender: {message.senderId}</p>
                            <p id="Content">{message.content}</p>
                            <p id="Receiver">Receiver: {message.receiverId}</p>
                        </div>
                    ))}
                </div>
            </div>
            <div id="MessageInputContainer">
                <input id="MessageInput" ref={inputRef} type="text"></input>
                <button id="MessageSend" onClick={handleSendMessage}>
                    Send
                </button>
            </div>
        </div>
    );
};

export default TestStenPage;

class UserLinkDTO {
    public senderId: number | undefined;
    public senderUsername: string | undefined;
    public senderEmail: string | undefined;
    public receiverId: number | undefined;
    public receiverUsername: string | undefined;
    public receiverEmail: string | undefined;
}

class MessageDTO {
    public senderId: number | undefined;
    public receiverId: number | undefined;
    public content: string | undefined;
}

const getMessages = async (): Promise<any[] | undefined> => {
    const body = new UserLinkDTO();
    body.senderId = 1;
    body.receiverId = 2;

    const messagesPage = 0;
    try {
        const response = await fetch(
            `http://localhost:8080/messages?page=${messagesPage}&size=${10}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            }
        );

        if (!response.ok) {
            throw new Error("Failed to fetch messages");
        }
        const data = await response.json();
        console.log(data.content);
        return data.content;
    } catch (error) {
        console.error(error);
        return [];
    }
};
