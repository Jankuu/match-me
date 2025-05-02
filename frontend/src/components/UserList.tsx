import React, { useEffect, useState } from 'react';
import { Card, Button, Row, Col, Image } from 'react-bootstrap';
import { FaComment, FaTrashAlt } from 'react-icons/fa';
import axios from 'axios';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';

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

const UserList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async (page = 0, size = 10) => {
    try {
      const response = await axios.get(`http://localhost:8080/users/all?page=${page}&size=${size}`);
      setUsers(response.data.content);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const handleChatClick = (e: React.MouseEvent, userId: number) => {
    e.stopPropagation();
    console.log(`Chat with user ID: ${userId}`);
    // TODO: implement chat with particular
  };

  const handleDeleteClick = (e: React.MouseEvent, userId: number) => {
    e.stopPropagation();
    console.log(`Delete user ID: ${userId}`);
    // TODO: implement DELETE FROM THE LIST request
  };

  const handleCardClick = (email: string) => {
    navigate(`/user_profile/${email}`, { state: { email } });
};

  const calculateAge = (birthDate: string | undefined) => {
    if (!birthDate) return '?';
    return dayjs().diff(dayjs(birthDate), 'year');
  };

  const getProfilePicture = (base64: string | undefined) => {
    if (!base64) return 'https://via.placeholder.com/50';
    return `data:image/jpeg;base64,${base64}`;
  };

  return (
    <div className="container mt-4">
      {users.map((user) => {
        const profile = user.profile || {};
        return (
          <div key={user.id} onClick={() => handleCardClick(user.email)} style={{ cursor: 'pointer' }}>
            <Card className="mb-3 shadow-sm">
  <Row className="align-items-center g-0">
    <Col xs={3} md={2} className="text-center">
      <Image
        src={getProfilePicture(profile.profilePicture)}
        roundedCircle
        width="50"
        height="50"
      />
    </Col>
    <Col xs={6} md={8}>
      <Card.Body className="py-2">
        <Card.Title className="mb-1">{profile.name || user.username}</Card.Title>
        <Card.Text className="mb-0 text-muted">
          {profile.gender}, {calculateAge(profile.birthDate)} years old
        </Card.Text>
      </Card.Body>
    </Col>
    <Col
      xs={3}
      md={2}
      className="d-flex justify-content-end align-items-center pe-3"
    >
      <div className="d-flex flex-row gap-4">
        <Button
          variant="link"
          onClick={(e) => handleChatClick(e, user.id)}
          className="p-0"
        >
          <FaComment size={18} />
        </Button>
        <Button
          variant="link"
          onClick={(e) => handleDeleteClick(e, user.id)}
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
      })}
    </div>
  );
};

export default UserList;
