import React, { useState, useEffect } from "react";
import { Form, Button } from "react-bootstrap";
import { User } from "../../types/User";
import HeightSet from "../formComponents/HeightSet";
import GenderSelector from "../formComponents/GenderSelection";
import NameInput from "../formComponents/NameInput";
import PreferredGenderSelector from "../formComponents/PreferredGenderSelector";
import BirthDateSelector from "../formComponents/BirthdateSelector";
import GameSelector from "../formComponents/GameSelector";
import { Game } from "../../dto/Game";
import axios from "axios";
import RadiusSelector from "../formComponents/RadiusSelector";
import ImageUpload from "../formComponents/ImageUpload"; // Assuming this is commented out, but good to check

interface AccountFormProps { // Corrected typo: AcoountFormProps -> AccountFormProps
  profile: User;
  editing: boolean;
  onProfileChange: (field: keyof User["profile"], value: any) => void;
  onRootChange: (field: keyof User, value: any) => void;
  onSave: () => void;
  // New prop for image handling
  onImageChange: (imageFile: File | null) => void;
  currentImageFile: File | null; // Pass the current file if it's already selected
  onLocationDataChange?: (locationData: any) => void; // This prop is commented out, but good to keep in mind for actual usage
}

const AccountForm: React.FC<AccountFormProps> = ({
  profile,
  editing,
  onProfileChange,
  onRootChange,
  onSave,
  onImageChange,
  currentImageFile 
  // onLocationDataChange // Commented out
}) => {
  const [isNameValid, setIsNameValid] = useState(true);

  const [games, setGames] = useState<Game[]>([]);
  const [selectedGames, setSelectedGames] = useState<Set<Game>>(new Set());

  // Use a local state for image if you need to manipulate it before passing to parent
  // However, it's often better to lift state for profile picture to MyProfilePage
  // if you're directly submitting it as part of the user patch.
  // For now, we'll assume `onImageChange` directly updates the parent's state.

  useEffect(() => {
    axios.get<Game[]>("http://localhost:8080/games")
      .then((response) => {
        setGames(response.data);

        const selected = new Set<Game>();
        // Ensure profile.interestedGames is not null/undefined before iterating
        if (profile.interestedGames) {
          response.data.forEach((game) => {
            if (
              profile.interestedGames!.some( // Removed optional chaining as we've checked `profile.interestedGames`
                (selectedGame) =>
                  selectedGame.id === game.id || selectedGame.name === game.name
              )
            ) {
              selected.add(game);
            }
          });
        }
        setSelectedGames(selected);
      })
      .catch((error) => {
        console.error("Failed to load games", error);
      });
  }, [profile.interestedGames]); // Dependency array should be fine if profile.interestedGames is stable

  const toggleGame = (game: Game) => {
    setSelectedGames((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(game)) {
        newSet.delete(game);
      } else {
        newSet.add(game);
      }
      onRootChange("interestedGames", Array.from(newSet));
      return newSet;
    });
  };

  const handleSaveInternal = () => {
    if (!isNameValid) return; //fix it
    onSave();
  };

  return (
    <Form>
      {/* Username (read-only) - Ensure value is always a string */}
      <Form.Group className="mb-3">
        <Form.Label>Username</Form.Label>
        <Form.Control
          type="text"
          value={profile.username || ""} // Ensure it's never undefined/null
          disabled
        />
      </Form.Group>

      {/* Email (read-only) - Ensure value is always a string */}
      <Form.Group className="mb-3">
        <Form.Label>Email</Form.Label>
        <Form.Control
          type="email"
          value={profile.email || ""} // Ensure it's never undefined/null
          disabled
        />
      </Form.Group>

      {/* Birth Date - Ensure birthDate is always a string */}
      <BirthDateSelector
        birthDate={profile.profile.birthDate || ""} // Provide empty string as default
        onChange={(value) => onProfileChange("birthDate", value)}
        disabled={!editing}
      />

      {/* Name - Ensure name is always a string */}
      <NameInput
        value={profile.profile.name || ""} // Provide empty string as default
        onChange={(value) => onProfileChange("name", value)}
        onValidate={setIsNameValid}
        disabled={!editing}
      />

      {/* Gender - Ensure gender is always a string */}
      <GenderSelector
        selected={profile.profile.gender || "man"} // Provide a default if it can be null/undefined
        onChange={(value) => onProfileChange("gender", value)}
        isEditable={editing}
      />

      {/* Height - Ensure height is always a number */}
      <HeightSet
        height={profile.profile.height || 150} // Provide a default number if it can be null/undefined
        setHeight={(value) => onProfileChange("height", value)}
        isEditable={editing}
      />
      {/* Location Selector (commented out) - If used, ensure value, placeId, coordinates are handled */}
       {/* <LocationSelector
            value={profile.profile.location || ""} // Default to empty string
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
            locationData={profile.locationData} // Ensure locationData is never undefined initially
        /> */}

      {/* Radius selector - Ensure radius is always a number */}
      <RadiusSelector
        radius={profile.radius || 5000} // Provide a default number
        setRadius={(value) => onRootChange("radius", value)}
        isEditable={editing}
      />

      {/* Preferred Gender - Ensure selected array is always defined */}
      <PreferredGenderSelector
        selected={profile.interestedGenders || []} // Provide empty array as default
        onChange={(genders: string[]) => onRootChange("interestedGenders", genders)}
        isEditable={editing}
      />

      {/* Description - Ensure value is always a string */}
      <Form.Group className="mb-3">
        <Form.Label>Description</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          value={profile.profile.description || ""} // Provide empty string as default
          disabled={!editing}
          onChange={(e) => onProfileChange("description", e.target.value)}
        />
      </Form.Group>

      {/* Games - Ensure selectedGames is handled correctly in state based on profile.interestedGames */}
      <GameSelector
        games={games}
        selectedGames={selectedGames} // This state is managed locally via useEffect and toggleGame
        onToggle={toggleGame}
        disabled={!editing}
      />
      {/* Image Upload Component - now integrated */}
      <ImageUpload
          image={currentImageFile} // Pass the current file if available
          setImage={onImageChange} // Use the prop to update parent state
          displayed={editing} // Control disabled state based on 'editing'
      />


      {editing && (
        <Button variant="success" onClick={handleSaveInternal}>
          Save Changes
        </Button>
      )}
    </Form>
  );
};

export default AccountForm;