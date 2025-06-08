import React, { useState } from 'react';
import { Card, Button, Row, Col, Image, Badge } from 'react-bootstrap'; // Importing Badge
import { FaComment, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { SwipeEventData, useSwipeable } from 'react-swipeable';
import { UserProfile } from '../../types/UserProfile';

/**
 * Defines the props for the SwipeableUserCard component.
 * @property {UserProfile} user - The user profile data to display on the card.
 * @property {'connections' | 'recommendations' | 'requests'} cardType -
 * Specifies the type of card, influencing the displayed actions/icons.
 * @property {(id: number) => void} onCardClick - Callback function invoked when the card itself is clicked (e.g., to view full profile).
 * @property {(e: React.MouseEvent | SwipeEventData, id: number, name: string) => void} onPrimaryAction -
 * Callback for the primary action (e.g., chat, accept, send request).
 * It receives the event object (mouse click or swipe data) and the user's ID and name.
 * @property {(e: React.MouseEvent | SwipeEventData, id: number) => void} onSecondaryAction -
 * Callback for the secondary action (e.g., reject, remove connection).
 * It receives the event object (mouse click or swipe data) and the user's ID.
 * @property {boolean} [isDeleting] - Optional: A flag indicating if the card is currently in a deleting state.
 * @property {number | null} currentUserId - The ID of the currently logged-in user.
 * @property {number} [unreadCount=0] - Optional: The number of unread messages for this user. Defaults to 0.
 */
interface Props {
    user: UserProfile;
    cardType: 'connections' | 'recommendations' | 'requests';
    onCardClick: (id: number) => void;
    onPrimaryAction: (e: React.MouseEvent | SwipeEventData) => void;
    onSecondaryAction: (e: React.MouseEvent | SwipeEventData) => void;
    isDeleting?: boolean;
    currentUserId: number | null; // NEW PROP
    unreadCount?: number; // NEW PROP
}

/**
 * SwipeableUserCard component.
 * Displays a compact user profile card with swipe and button actions.
 * It's designed to be used within lists like those in MatchingSection.
 */
const SwipeableUserCard: React.FC<Props> = ({
    user,
    cardType,
    onCardClick,
    onPrimaryAction,
    onSecondaryAction,
    currentUserId, // Destructure the new prop
    unreadCount = 0, // Destructure the new prop with default value
}) => {
    const [isAnimating, setIsAnimating] = useState(false);

    const calculateAge = (birthDate?: string | null): number | null => {
        if (!birthDate) return null;
        const birth = new Date(birthDate);
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    };

    const getProfilePictureSrc = (base64?: string | null): string | null => {
        if (!base64) return null;
        return base64.startsWith("data:image") ? base64 : `data:image/jpeg;base64,${base64}`;
    };

    const handleSwipeLeft = () => {
        setIsAnimating(true);
        setTimeout(() => {
            onSecondaryAction({} as React.MouseEvent | SwipeEventData); // Consistent with new type
        }, 500);
    };

    const handlePrimaryClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onPrimaryAction(e);
    };

    const handleRejectClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsAnimating(true);
        setTimeout(() => onSecondaryAction(e), 500);
    };

    const swipeHandlers = useSwipeable({
        onSwipedLeft: handleSwipeLeft,
        preventScrollOnSwipe: true,
        trackMouse: true,
    });

    const userName = user.name || 'Noname';
    const userGender = user.gender || 'Not specified';
    const userAge = calculateAge(user.birthDate);
    const profilePictureSrc = getProfilePictureSrc(user.profilePicture);

    const renderPrimaryIcon = () => {
        if (cardType === 'connections') {
            return (
                <div style={{ position: 'relative', display: 'inline-block' }}>
                    <FaComment size={30} />
                    {/* Display unread message badge only for connections */}
                    {unreadCount > 0 && (
                        <Badge
                            bg="danger"
                            pill
                            className="position-absolute top-0 start-100 translate-middle"
                            style={{ fontSize: '0.7em', padding: '0.3em 0.5em', border: '1px solid white' }}
                        >
                            {unreadCount}
                        </Badge>
                    )}
                </div>
            );
        }
        return <FaCheckCircle size={30} color="green" />;
    };

    const renderSecondaryIcon = () => {
        return <FaTimesCircle size={30} color="red" />;
    };

    return (
        <div
            {...swipeHandlers}
            onClick={() => onCardClick(user.id)}
            className={isAnimating ? 'slide-out-left bgc-light' : ''}
            style={{ cursor: 'pointer' }}
        >
            <Card className="mb-3 shadow-sm">
                <Row className="align-items-center g-0">
                    <Col xs={3} md={2} className="text-center d-flex justify-content-center">
                        {profilePictureSrc ? (
                            <Image
                                src={profilePictureSrc}
                                roundedCircle
                                width="50"
                                height="50"
                                alt="Profile"
                                style={{ objectFit: 'cover' }}
                            />
                        ) : (
                            <div
                                className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center"
                                style={{ width: "50px", height: "50px", fontSize: "1.2em", objectFit: 'cover' }}
                            >
                                {(userName || 'U').charAt(0).toUpperCase()}
                            </div>
                        )}
                    </Col>
                    <Col xs={6} md={8}>
                        <Card.Body className="py-2">
                            <Card.Title className="mb-1">{userName}</Card.Title>
                            <Card.Text className="mb-0 text-muted">
                                {userGender}, {userAge !== null ? `${userAge} years old` : 'Age unknown'}
                            </Card.Text>
                        </Card.Body>
                    </Col>
                    <Col xs={3} md={2} className="d-flex justify-content-end align-items-center pe-3">
                        <div className="d-flex flex-row gap-3">
                            <Button variant="link" onClick={handlePrimaryClick} className="p-0">
                                {renderPrimaryIcon()}
                            </Button>
                            <Button variant="link" onClick={handleRejectClick} className="p-0">
                                {renderSecondaryIcon()}
                            </Button>
                        </div>
                    </Col>
                </Row>
            </Card>
        </div>
    );
};

export default SwipeableUserCard;