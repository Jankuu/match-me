// src/components/SwipeableUserCard.tsx
import React, { useState } from 'react';
import { Card, Button, Row, Col, Image } from 'react-bootstrap';
import { FaComment, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { SwipeEventData, useSwipeable } from 'react-swipeable';
import { UserProfile } from '../types/UserProfile';

// Assuming UserProfile type is consistent across the application,
// and it now allows for optional/nullable properties.
// Make sure src/types/UserProfile.ts defines it like this:
/*
export type UserProfile = {
  id: number;
  name?: string | null;
  profilePicture?: string | null;
  birthDate?: string | null;
  gender?: 'man' | 'woman' | string;
  height?: number | null;
  description?: string | null;
};
*/

interface Props {
  user: UserProfile;
  cardType: 'connections' | 'recommendations' | 'requests';
  onCardClick: (id: number) => void;
  // onPrimaryAction and onSecondaryAction should not stop event propagation themselves.
  onPrimaryAction: (e: React.MouseEvent | SwipeEventData) => void;
  onSecondaryAction: (e: React.MouseEvent | SwipeEventData) => void;
  isDeleting?: boolean; // Not used in this component, but kept for type compatibility
  // Replaced with direct access in the component as it's cleaner than passing functions for simple logic
  // getProfilePicture: (base64: string | undefined) => string;
  // calculateAge: (birthDate: string | undefined) => string | number;
}

const SwipeableUserCard: React.FC<Props> = ({
  user,
  cardType,
  onCardClick,
  onPrimaryAction,
  onSecondaryAction,
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  // Helper function to calculate age (can be moved to a utils file if desired)
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

  // Helper function to get profile picture source or base64
  const getProfilePictureSrc = (base64?: string | null): string | null => {
    if (!base64) return null;
    return base64.startsWith("data:image") ? base64 : `data:image/jpeg;base64,${base64}`;
  };

  // Handlers for swipe actions
  const handleSwipeLeft = () => {
    setIsAnimating(true);
    setTimeout(() => {
      onSecondaryAction({} as React.MouseEvent); // Pass a dummy mouse event for consistency
    }, 500);
  };

  // Handle primary action button click (e.g., Chat or Accept)
  const handlePrimaryClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Stop event bubbling to prevent onCardClick
    onPrimaryAction(e);
  };

  // Handle reject/secondary action button click
  const handleRejectClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Stop event bubbling
    setIsAnimating(true);
    setTimeout(() => onSecondaryAction(e), 500);
  };

  // Configure swipe handlers
  const swipeHandlers = useSwipeable({
    onSwipedLeft: handleSwipeLeft,
    preventScrollOnSwipe: true, // Prevent page scroll during swipe
    trackMouse: true, // Enable swipe detection for mouse events
  });

  // Extract user data with fallbacks for display
  const userName = user.name || 'Noname';
  const userGender = user.gender || 'Not specified'; // Provide a more descriptive fallback
  const userAge = calculateAge(user.birthDate); // Now can be null
  const profilePictureSrc = getProfilePictureSrc(user.profilePicture);

  // Render icon for primary action based on cardType
  const renderPrimaryIcon = () => {
    if (cardType === 'connections') return <FaComment size={30} />;
    return <FaCheckCircle size={30} color="green" />;
  };

  // Render icon for secondary action
  const renderSecondaryIcon = () => {
    return <FaTimesCircle size={30} color="red" />;
  };

  return (
    <div
      {...swipeHandlers}
      onClick={() => onCardClick(user.id)} // This click fires unless stopped by child elements
      className={isAnimating ? 'slide-out-left bgc-light' : ''}
      style={{ cursor: 'pointer' }}
    >
      <Card className="mb-3 shadow-sm">
        <Row className="align-items-center g-0">
          <Col xs={3} md={2} className="text-center d-flex justify-content-center">
            {/* Conditional rendering for profile picture or placeholder */}
            {profilePictureSrc ? (
              <Image
                src={profilePictureSrc}
                roundedCircle
                width="50"
                height="50"
                alt="Profile"
                style={{ objectFit: 'cover' }} // Ensure image covers the circle
              />
            ) : (
              <div
                className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center"
                style={{ width: "50px", height: "50px", fontSize: "1.2em", objectFit: 'cover' }} // Smaller font size for smaller circle
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