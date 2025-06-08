import React from "react";
import { Button } from "react-bootstrap";
import { ArrowLeft } from "react-bootstrap-icons";
import { useNavigate } from "react-router-dom";

interface ChatHeaderProps {
    receiverName: string;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ receiverName }) => {
    const navigate = useNavigate();

    return (
        <div className="chat-header px-3 pt-3 d-flex align-items-center border-bottom">
            <Button onClick={() => navigate("/matching")} className="d-flex align-items-center p-2">
                <ArrowLeft size={20} className="me-1" /> Back
            </Button>
            <h3 className="text-center flex-grow-1 mb-0 pe-5">Chat with {receiverName}</h3>
        </div>
    );
};

export default ChatHeader;