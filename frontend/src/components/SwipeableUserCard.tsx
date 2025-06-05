import React, { useState } from 'react';
import { Card, Button, Row, Col, Image } from 'react-bootstrap';
import { FaComment, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { useSwipeable } from 'react-swipeable';

type UserProfile = {
  id: number;
  name: string;
  profilePicture?: string;
  birthDate?: string;
  gender?: 'man' | 'woman' | string;
  height?: number;
  description?: string;
};

interface Props {
  user: UserProfile;
  cardType: 'connections' | 'recommendations' | 'requests';
  onCardClick: (id: number) => void;
  onPrimaryAction: (e: React.MouseEvent) => void;
  onSecondaryAction: (e: React.MouseEvent) => void;
  isDeleting?: boolean;
  getProfilePicture: (base64: string | undefined) => string;
  calculateAge: (birthDate: string | undefined) => string | number;
}

const SwipeableUserCard: React.FC<Props> = ({
  user,
  cardType,
  onCardClick,
  onPrimaryAction,
  onSecondaryAction,
  getProfilePicture,
  calculateAge,
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleSwipeLeft = () => {
    setIsAnimating(true);
    setTimeout(() => {
      onSecondaryAction({} as React.MouseEvent);
    }, 500);
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

  const name = user.name || 'Noname';
  const gender = user.gender || 'ellien';
  const age = calculateAge(user.birthDate);
  const profilePic = getProfilePicture(user.profilePicture);

  const renderPrimaryIcon = () => {
    if (cardType === 'connections') return <FaComment size={30} />;
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
          <Col xs={3} md={2} className="text-center">
            <Image
              src={profilePic || '../public/Profile-Placeholder.jpg'}
              roundedCircle
              width="50"
              height="50"
              alt="Profile"
            />
          </Col>
          <Col xs={6} md={8}>
            <Card.Body className="py-2">
              <Card.Title className="mb-1">{name}</Card.Title>
              <Card.Text className="mb-0 text-muted">
                {gender}, {age} years old
              </Card.Text>
            </Card.Body>
          </Col>
          <Col xs={3} md={2} className="d-flex justify-content-end align-items-center pe-3">
            <div className="d-flex flex-row gap-3">
              <Button variant="link" onClick={onPrimaryAction} className="p-0">
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
