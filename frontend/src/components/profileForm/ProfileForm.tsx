import React, { useState, useEffect } from "react";
import { Form, Button } from "react-bootstrap";
import { User } from "../../types/User";
import HeightSet from "../registrationComponents/HeightSet";
import GenderSelector from "../registrationComponents/GenderSelection";
import NameInput from "../registrationComponents/NameInput";
import PreferredGenderSelector from "../registrationComponents/PreferredGenderSelector";
import BirthDateSelector from "../registrationComponents/BirthdateSelector";
import GameSelector from "../registrationComponents/GameSelector";
import { Game } from "../../dto/Game";
import axios from "axios";

interface ProfileFormProps {
  profile: User;
  editing: boolean;
  onProfileChange: (field: keyof User["profile"], value: any) => void;
  onRootChange: (field: keyof User, value: any) => void;
  onSave: () => void;
  onLocationDataChange?: (locationData: any) => void;
}

const ProfileForm: React.FC<ProfileFormProps> = ({
  profile,
  editing,
  onProfileChange,
  onRootChange,
  onSave,
  onLocationDataChange
}) => {
  const [isNameValid, setIsNameValid] = useState(true);

  const [games, setGames] = useState<Game[]>([]);
  const [selectedGames, setSelectedGames] = useState<Set<Game>>(new Set());

  useEffect(() => {
    axios.get<Game[]>("http://localhost:8080/games")
      .then((response) => {
        setGames(response.data);

        // Set selected games from profile (matching by name or id if available)
        const selected = new Set<Game>();
        response.data.forEach((game) => {
          if (
            profile.interestedGames?.some(
              (selectedGame) =>
                selectedGame.id === game.id || selectedGame.name === game.name
            )
          ) {
            selected.add(game);
          }
        });
        setSelectedGames(selected);
      })
      .catch((error) => {
        console.error("Failed to load games", error);
      });
  }, [profile.interestedGames]);

  const toggleGame = (game: Game) => {
    setSelectedGames((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(game)) {
        newSet.delete(game);
      } else {
        newSet.add(game);
      }
      // Update root object
      onRootChange("interestedGames", Array.from(newSet));
      return newSet;
    });
  };

  const handleSaveInternal = () => {
    if (!isNameValid) return;
    onSave();
  };

  return (
    <Form>
      {/* Username (read-only) */}
      <Form.Group className="mb-3">
        <Form.Label>Username</Form.Label>
        <Form.Control type="text" value={profile.username} disabled />
      </Form.Group>

      {/* Email (read-only) */}
      <Form.Group className="mb-3">
        <Form.Label>Email</Form.Label>
        <Form.Control type="email" value={profile.email} disabled />
      </Form.Group>

      {/* Birth Date */}
      <BirthDateSelector
        birthDate={profile.profile.birthDate || ""}
        onChange={(value) => onProfileChange("birthDate", value)}
        disabled={!editing}
      />

      {/* Name */}
      <NameInput
        value={profile.profile.name}
        onChange={(value) => onProfileChange("name", value)}
        onValidate={setIsNameValid}
        disabled={!editing}
      />

      {/* Gender */}
      <GenderSelector
        selected={profile.profile.gender}
        onChange={(value) => onProfileChange("gender", value)}
        isEditable={editing}
      />

      {/* Height */}
      <HeightSet
        height={profile.profile.height}
        setHeight={(value) => onProfileChange("height", value)}
        isEditable={editing}
      />
      {/* Location */}
       {/* <LocationSelector
            value={profile.profile.location || ""}
            onChange={(value, placeId, coordinates, isGpsUsed) => {
                onProfileChange("location", value);
                if (placeId && coordinates) {
                    const newLocationData = {
                        placeId,
                        coordinates,
                        isGpsUsed: isGpsUsed || false
                    };
                    onLocationDataChange(newLocationData);
                } else if (value === '') {
                    onLocationDataChange(undefined);
                }
            }}
            isEditable={editing}
            locationData={profile.locationData}
        /> */}

      <RadiusSelector 
        value={profile.radius}
        onChange={(value) => onRootChange("radius", value)}
        isEditable={true}
      />

      {/* Preferred Gender */}
      <PreferredGenderSelector
        selected={profile.interestedGenders}
        onChange={(genders) => onRootChange("interestedGenders", genders)}
        isEditable={editing}
      />

      {/* Description */}
      <Form.Group className="mb-3">
        <Form.Label>Description</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          value={profile.profile.description || ""}
          disabled={!editing}
          onChange={(e) => onProfileChange("description", e.target.value)}
        />
      </Form.Group>

      {/* Games */}
      <GameSelector
        games={games}
        selectedGames={selectedGames}
        onToggle={toggleGame}
      />

      {editing && (
        <Button variant="success" onClick={handleSaveInternal}>
          Save Changes
        </Button>
      )}
    </Form>
  );
};

export default ProfileForm;
