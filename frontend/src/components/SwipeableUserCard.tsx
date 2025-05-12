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
  onCardClick: (email: string) => void;
  onChatClick: (e: React.MouseEvent, id: number, username: string) => void;
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

  return (
    <div {...swipeHandlers} onClick={() => onCardClick(user.email)} style={{ cursor: 'pointer' }}>
      <Card className={`mb-3 shadow-sm ${isDeleting ? 'slide-out-left' : ''}`}>
        <Row className="align-items-center g-0">
          <Col xs={3} md={2} className="text-center">
            <Image
              src={getProfilePicture(user.profile?.profilePicture)}
              roundedCircle
              width="50"
              height="50"
            />
          </Col>
          <Col xs={6} md={8}>
            <Card.Body className="py-2">
              <Card.Title className="mb-1">{user.profile?.name || user.username}</Card.Title>
              <Card.Text className="mb-0 text-muted">
                {user.profile?.gender}, {calculateAge(user.profile?.birthDate)} years old
              </Card.Text>
            </Card.Body>
          </Col>
          <Col xs={3} md={2} className="d-flex justify-content-end align-items-center pe-3">
            <div className="d-flex flex-row gap-4">
              <Button variant="link" onClick={(e) => onChatClick(e, user.id, user.username)} className="p-0">
                <FaComment size={18} />
              </Button>
              <Button variant="link" onClick={(e) => onDeleteClick(e, user.id)} className="p-0">
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
