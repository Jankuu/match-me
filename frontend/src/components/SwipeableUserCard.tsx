import React from 'react';
import { Card, Button, Row, Col, Image } from 'react-bootstrap';
import { FaComment, FaTrashAlt } from 'react-icons/fa';
import { useSwipeable } from 'react-swipeable';

type User = {
  id: number;
  username: string;
  email: string;
  profile?: {
    name?: string;
    gender?: string;
    birthDate?: string;
    profilePicture?: string;
  };
};

interface Props {
  user: User;
  onCardClick: (username: string) => void;
  onChatClick: (e: React.MouseEvent, username: string) => void;
  onDeleteClick: (e: React.MouseEvent, id: number) => void;
  onSwipeLeft: () => void;
  isDeleting: boolean;
  getProfilePicture: (base64: string | undefined) => string;
  calculateAge: (birthDate: string | undefined) => string | number;
}

const SwipeableUserCard: React.FC<Props> = ({
  user,
  onCardClick,
  onChatClick,
  onDeleteClick,
  onSwipeLeft,
  isDeleting,
  getProfilePicture,
  calculateAge,
}) => {
  const swipeHandlers = useSwipeable({
    onSwipedLeft: onSwipeLeft,
    preventScrollOnSwipe: true,
    trackMouse: true,
  });

  const name = user.profile?.name || user.username;
  const gender = user.profile?.gender || 'Unknown';
  const age = calculateAge(user.profile?.birthDate);
  const profilePic = getProfilePicture(user.profile?.profilePicture);

  return (
    <div {...swipeHandlers} onClick={() => onCardClick(user.username)} style={{ cursor: 'pointer' }}>
      <Card className={`mb-3 shadow-sm ${isDeleting ? 'slide-out-left' : ''}`}>
        <Row className="align-items-center g-0">
          <Col xs={3} md={2} className="text-center">
            <Image
              src={profilePic || 'https://via.placeholder.com/50'}
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
              <Button
                variant="link"
                onClick={(e) => onChatClick(e, user.username)}
                className="p-0"
              >
                <FaComment size={18} />
              </Button>
              <Button
                variant="link"
                onClick={(e) => onDeleteClick(e, user.id)}
                className="p-0"
              >
                <FaTrashAlt size={18} />
              </Button>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default SwipeableUserCard;
