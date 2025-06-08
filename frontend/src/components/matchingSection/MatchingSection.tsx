import React from 'react';
import { Accordion, Badge } from 'react-bootstrap';
import SwipeableUserCard from './SwipeableUserCard';
import { UserProfile } from '../../types/UserProfile';
import { SwipeEventData } from 'react-swipeable';
import "../../styles/ColorPallette.css";

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
 * @property {number | null} currentUserId - The ID of the currently logged-in user.
 * @property {{ [userId: number]: number }} unreadMessages - Map of user IDs to their unread message counts.
 */
type Props = {
    title: string;
    users: UserProfile[];
    cardType: 'connections' | 'recommendations' | 'requests';
    onPrimary: (e: React.MouseEvent | SwipeEventData, id: number, name: string) => void;
    onSecondary: (e: React.MouseEvent | SwipeEventData, id: number) => void;
    onCardClick: (id: number) => void;
    hasUnreadRequests?: boolean;
    currentUserId: number | null; // NEW PROP
    unreadMessages: { [userId: number]: number }; // NEW PROP
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
    hasUnreadRequests,
    currentUserId, // Destructure the new prop
    unreadMessages // Destructure the new prop
}) => (
    // Accordion.Item groups the header and body for a collapsible section
    <Accordion.Item eventKey={title}>
        {/* Accordion.Header is the clickable title of the section */}
        <Accordion.Header className="position-relative">
            {/* Display the section title and the count of users in this section */}
            {title} ({users.length})
            {/* Conditional rendering of the "New" badge for connection/request notifications */}
            {hasUnreadRequests && (
                <Badge
                    bg="danger"
                    pill
                    className="ms-2"
                    style={{ fontSize: '0.7em', padding: '0.3em 0.5em' }}
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
                    key={user.id}
                    user={user}
                    cardType={cardType}
                    onCardClick={onCardClick}
                    onPrimaryAction={(e) => onPrimary(e, user.id, user.name)}
                    onSecondaryAction={(e) => onSecondary(e, user.id)}
                    isDeleting={false}
                    // Pass currentUserId and unread count to SwipeableUserCard
                    currentUserId={currentUserId} // NEW
                    unreadCount={unreadMessages[user.id] || 0} // NEW: Get unread count for this specific user
                />
            ))}
        </Accordion.Body>
    </Accordion.Item>
);

export default MatchingSection;