import React, { useState } from 'react';
import { Card, Button, Row, Col, Image } from 'react-bootstrap'; // Importing Bootstrap components
import { FaComment, FaCheckCircle, FaTimesCircle } from 'react-icons/fa'; // Importing Font Awesome icons
import { SwipeEventData, useSwipeable } from 'react-swipeable'; // Importing swipe hooks and types
import { UserProfile } from '../types/UserProfile'; // Importing UserProfile interface

/**
 * Defines the props for the SwipeableUserCard component.
 * @property {UserProfile} user - The user profile data to display on the card.
 * @property {'connections' | 'recommendations' | 'requests'} cardType -
 * Specifies the type of card, influencing the displayed actions/icons.
 * @property {(id: number) => void} onCardClick - Callback function invoked when the card itself is clicked (e.g., to view full profile).
 * @property {(e: React.MouseEvent | SwipeEventData) => void} onPrimaryAction -
 * Callback for the primary action (e.g., chat, accept, send request).
 * It receives the event object (mouse click or swipe data).
 * @property {(e: React.MouseEvent | SwipeEventData) => void} onSecondaryAction -
 * Callback for the secondary action (e.g., reject, remove connection).
 * It receives the event object (mouse click or swipe data).
 * @property {boolean} [isDeleting] - Optional: A flag indicating if the card is currently in a deleting state.
 * (Note: This prop is currently not actively used in this component but kept for type compatibility).
 */
interface Props {
    user: UserProfile;
    cardType: 'connections' | 'recommendations' | 'requests';
    onCardClick: (id: number) => void;
    onPrimaryAction: (e: React.MouseEvent | SwipeEventData) => void;
    onSecondaryAction: (e: React.MouseEvent | SwipeEventData) => void;
    isDeleting?: boolean;
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
    // isDeleting, // Destructure if used
}) => {
    // State to trigger animation for card removal (e.g., slide-out)
    const [isAnimating, setIsAnimating] = useState(false);

    /**
     * Helper function to calculate age from a birth date string.
     * Returns age in years or null if birthDate is invalid/missing.
     */
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

    /**
     * Helper function to determine the profile picture source.
     * Handles both direct base64 strings and converting them to a data URL.
     * Returns a data URL string or null if no picture is provided.
     */
    const getProfilePictureSrc = (base64?: string | null): string | null => {
        if (!base64) return null;
        // Check if it's already a data URL (e.g., "data:image/jpeg;base64,...")
        return base64.startsWith("data:image") ? base64 : `data:image/jpeg;base64,${base64}`;
    };

    /**
     * Handles the swipe left gesture.
     * Triggers an animation and then calls the secondary action.
     */
    const handleSwipeLeft = () => {
        setIsAnimating(true); // Start the slide-out animation
        // Delay calling the action to allow the animation to complete
        setTimeout(() => {
            onSecondaryAction({} as React.MouseEvent); // Pass a dummy mouse event for consistency
        }, 500); // Matches the animation duration (e.g., from CSS)
    };

    /**
     * Handles click on the primary action button.
     * Prevents event bubbling to the parent card's onClick handler.
     */
    const handlePrimaryClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevents onCardClick from firing
        onPrimaryAction(e);
    };

    /**
     * Handles click on the reject/secondary action button.
     * Prevents event bubbling and triggers an animation before calling the action.
     */
    const handleRejectClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevents onCardClick from firing
        setIsAnimating(true); // Start the slide-out animation
        // Delay calling the action to allow the animation to complete
        setTimeout(() => onSecondaryAction(e), 500); // Matches the animation duration
    };

    // Configure the useSwipeable hook for swipe detection
    const swipeHandlers = useSwipeable({
        onSwipedLeft: handleSwipeLeft, // Assign handler for left swipe
        preventScrollOnSwipe: true, // Prevents the browser from scrolling when swiping
        trackMouse: true, // Enables swipe detection for mouse events as well as touch
    });

    // Prepare user data for display with fallbacks for missing information
    const userName = user.name || 'Noname'; // Default name if not provided
    const userGender = user.gender || 'Not specified'; // Default gender if not provided
    const userAge = calculateAge(user.birthDate); // Calculate age, can be null
    const profilePictureSrc = getProfilePictureSrc(user.profilePicture); // Get image source or null

    /**
     * Renders the appropriate icon for the primary action based on cardType.
     */
    const renderPrimaryIcon = () => {
        // For 'connections' (established matches), the primary action is typically chat
        if (cardType === 'connections') return <FaComment size={30} />;
        // For 'recommendations' or 'requests', the primary action is usually to accept/check
        return <FaCheckCircle size={30} color="green" />;
    };

    /**
     * Renders the appropriate icon for the secondary action (reject/remove).
     */
    const renderSecondaryIcon = () => {
        return <FaTimesCircle size={30} color="red" />; // A red 'X' icon
    };

    return (
        // The main div that handles swipe gestures and general card click
        <div
            {...swipeHandlers} // Apply swipe handlers to this div
            onClick={() => onCardClick(user.id)} // Clicks on card body trigger this, unless stopped by children
            // Apply animation class if isAnimating state is true
            className={isAnimating ? 'slide-out-left bgc-light' : ''}
            style={{ cursor: 'pointer' }} // Indicate clickability
        >
            <Card className="mb-3 shadow-sm"> {/* Bootstrap Card for styling */}
                <Row className="align-items-center g-0"> {/* Use Row/Col for responsive layout */}
                    <Col xs={3} md={2} className="text-center d-flex justify-content-center">
                        {/* Conditional rendering: display profile picture or a placeholder initial */}
                        {profilePictureSrc ? (
                            <Image
                                src={profilePictureSrc}
                                roundedCircle // Make the image circular
                                width="50"
                                height="50"
                                alt="Profile"
                                style={{ objectFit: 'cover' }} // Ensure image fills the circle without distortion
                            />
                        ) : (
                            <div
                                className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center"
                                style={{ width: "50px", height: "50px", fontSize: "1.2em", objectFit: 'cover' }}
                            >
                                {/* Display first letter of name as a placeholder */}
                                {(userName || 'U').charAt(0).toUpperCase()}
                            </div>
                        )}
                    </Col>
                    <Col xs={6} md={8}>
                        <Card.Body className="py-2"> {/* Card body for text content */}
                            <Card.Title className="mb-1">{userName}</Card.Title> {/* User's name */}
                            <Card.Text className="mb-0 text-muted">
                                {/* Display gender and age, with fallbacks */}
                                {userGender}, {userAge !== null ? `${userAge} years old` : 'Age unknown'}
                            </Card.Text>
                        </Card.Body>
                    </Col>
                    <Col xs={3} md={2} className="d-flex justify-content-end align-items-center pe-3">
                        <div className="d-flex flex-row gap-3"> {/* Container for action buttons */}
                            {/* Primary action button */}
                            <Button variant="link" onClick={handlePrimaryClick} className="p-0">
                                {renderPrimaryIcon()}
                            </Button>
                            {/* Secondary action button (reject/remove) */}
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

export default SwipeableUserCard; // Export the component