import React from 'react';
import { Accordion, Badge } from 'react-bootstrap'; // Importing Accordion and Badge components
import SwipeableUserCard from './SwipeableUserCard'; // Importing the custom SwipeableUserCard component
import { UserProfile } from '../types/UserProfile'; // Importing the UserProfile interface
// Removed these imports as they are now handled within SwipeableUserCard
// import { calculateAge, getProfilePicture } from '../utils/userUtils';
import { SwipeEventData } from 'react-swipeable'; // Importing SwipeEventData type for swipe events
import "../styles/ColorPallette.css"; // Importing global styles

/**
 * Defines the props for the MatchingSection component.
 * @property {string} title - The title of the accordion section (e.g., "CONNECTIONS").
 * @property {UserProfile[]} users - An array of user profiles to display in this section.
 * @property {'connections' | 'recommendations' | 'requests'} cardType - Specifies the type of cards,
 * influencing actions and possibly styling.
 * @property {(e: React.MouseEvent | SwipeEventData, id: number, name: string) => void} onPrimary -
 * Callback for the primary action on a user card (e.g., chat, send request, accept request).
 * Takes event, user ID, and user name.
 * @property {(e: React.MouseEvent | SwipeEventData, id: number) => void} onSecondary -
 * Callback for the secondary action on a user card (e.g., remove connection, reject recommendation/request).
 * Takes event and user ID.
 * @property {(id: number) => void} onCardClick - Callback for clicking anywhere on the user card
 * (typically navigates to the user's full profile).
 * @property {boolean} [hasUnreadRequests] - Optional: A flag indicating if there are unread items in this section,
 * which triggers a "New" badge.
 */
type Props = {
    title: string;
    users: UserProfile[];
    cardType: 'connections' | 'recommendations' | 'requests';
    onPrimary: (e: React.MouseEvent | SwipeEventData, id: number, name: string) => void;
    onSecondary: (e: React.MouseEvent | SwipeEventData, id: number) => void;
    onCardClick: (id: number) => void;
    hasUnreadRequests?: boolean; // NEW PROP for notification badge
};

/**
 * MatchingSection component.
 * This component renders an individual section within an Accordion on the MatchingPage.
 * It displays a list of user profiles (e.g., connections, recommendations, requests)
 * and provides primary/secondary actions, and a clickable card to view profiles.
 * It also shows a "New" badge if there are unread items.
 */
const MatchingSection: React.FC<Props> = ({
    title,
    users,
    cardType,
    onPrimary,
    onSecondary,
    onCardClick,
    hasUnreadRequests // Destructure the new prop
}) => (
    // Accordion.Item groups the header and body for a collapsible section
    <Accordion.Item eventKey={title}>
        {/* Accordion.Header is the clickable title of the section */}
        <Accordion.Header className="position-relative"> {/* position-relative for badge positioning */}
            {/* Display the section title and the count of users in this section */}
            {title} ({users.length})
            {/* Conditional rendering of the "New" badge */}
            {hasUnreadRequests && (
                <Badge
                    bg="danger" // Red background for "danger" (new/unread)
                    pill // Pill shape for a rounded look
                    className="ms-2" // Margin-start for spacing from text
                    style={{ fontSize: '0.7em', padding: '0.3em 0.5em' }} // Custom inline styles for size
                >
                    New
                </Badge>
            )}
        </Accordion.Header>
        {/* Accordion.Body contains the collapsible content */}
        <Accordion.Body>
            {/* Map through the users array and render a SwipeableUserCard for each */}
            {users.map(user => (
                <SwipeableUserCard
                    key={user.id} // Unique key for list rendering
                    user={user} // Pass the UserProfile object
                    cardType={cardType} // Pass the type of card to influence internal logic/styling
                    onCardClick={onCardClick} // Callback for clicking the card
                    // Pass actions, ensuring they receive the correct user data (ID and name)
                    onPrimaryAction={(e) => onPrimary(e, user.id, user.name)}
                    onSecondaryAction={(e) => onSecondary(e, user.id)}
                    isDeleting={false} // Placeholder for a deleting state (not used in this component directly)
                />
            ))}
        </Accordion.Body>
    </Accordion.Item>
);

export default MatchingSection; // Export the component for use in other parts of the app