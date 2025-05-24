import React from 'react';
import { Accordion } from 'react-bootstrap';
import SwipeableUserCard from './SwipeableUserCard';
import { UserProfile } from '../types/UserProfile';
import { calculateAge, getProfilePicture } from '../utils/userUtils';
import { SwipeEventData } from 'react-swipeable';

type Props = {
  title: string;
  users: UserProfile[];
  cardType: 'connections' | 'recommendations' | 'requests';
  onPrimary: (e: React.MouseEvent | SwipeEventData, id: number) => void;
  onSecondary: (e: React.MouseEvent | SwipeEventData, id: number) => void;
  onCardClick: (id: number) => void;
};

const MatchingSection: React.FC<Props> = ({ title, users, cardType, onPrimary, onSecondary, onCardClick }) => (
  <Accordion.Item eventKey={title}>
    <Accordion.Header>{title} ({users.length})</Accordion.Header>
    <Accordion.Body>
      {users.map(user => (
        <SwipeableUserCard
          key={user.id}
          user={user}
          cardType={cardType}
          onCardClick={onCardClick}
          onPrimaryAction={(e) => onPrimary(e, user.id)}
        onSecondaryAction={(e) => onSecondary(e, user.id)}
          isDeleting={false}
          getProfilePicture={getProfilePicture}
          calculateAge={calculateAge}
        />
      ))}
    </Accordion.Body>
  </Accordion.Item>
);

export default MatchingSection;
