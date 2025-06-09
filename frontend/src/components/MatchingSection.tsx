// src/components/MatchingSection.tsx
import React from "react";
import { Accordion, Badge } from "react-bootstrap";
import SwipeableUserCard from "./SwipeableUserCard";
import { UserProfile } from "../types/UserProfile";
// Remove these imports as they are now handled within SwipeableUserCard
// import { calculateAge, getProfilePicture } from '../utils/userUtils';
import { SwipeEventData } from "react-swipeable";
import "../styles/ColorPallette.css";

type Props = {
    title: string;
    users: UserProfile[];
    cardType: "connections" | "recommendations" | "requests";
    onPrimary: (
        e: React.MouseEvent | SwipeEventData,
        id: number,
        name: string,
        otherUserProfile: UserProfile
    ) => void;
    onSecondary: (e: React.MouseEvent | SwipeEventData, id: number) => void;
    onCardClick: (id: number) => void;
    hasUnreadRequests?: boolean; // NEW PROP
};

const MatchingSection: React.FC<Props> = ({
    title,
    users,
    cardType,
    onPrimary,
    onSecondary,
    onCardClick,
    hasUnreadRequests, // Use the new prop
}) => (
    <Accordion.Item eventKey={title}>
        <Accordion.Header className="position-relative">
            {" "}
            {/* Added position-relative */}
            {title} ({users.length})
            {hasUnreadRequests && ( // Conditional rendering of the badge
                <Badge
                    bg="danger"
                    pill
                    className="ms-2" // Margin-start for spacing from text
                    style={{ fontSize: "0.7em", padding: "0.3em 0.5em" }} // Adjust font size and padding
                >
                    New
                </Badge>
            )}
        </Accordion.Header>
        <Accordion.Body>
            {users.map((user) => (
                <SwipeableUserCard
                    key={user.id}
                    user={user}
                    cardType={cardType}
                    onCardClick={onCardClick}
                    onPrimaryAction={(e) =>
                        onPrimary(e, user.id, user.name, user)
                    }
                    onSecondaryAction={(e) => onSecondary(e, user.id)}
                    isDeleting={false}
                />
            ))}
        </Accordion.Body>
    </Accordion.Item>
);

export default MatchingSection;
