import React, { useState, useEffect, useCallback } from "react";
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
import ImageUpload from "../formComponents/ImageUpload";
import LocationSelector from "../formComponents/LocationSelector.tsx";

interface AccountFormProps {
  profile: User;
  editing: boolean;
  onProfileChange: (field: keyof User["profile"], value: any) => void;
  onRootChange: (field: keyof User, value: any) => void;
  onSave: () => void;
  onImageChange: (imageFile: File | null) => void;
  currentImageFile: File | null;
  onLocationDataChange?: (locationData: any) => void; // Not used in this version but kept for type safety
  onClearProfilePicture: () => void;
  onBirthDateValidationChange: (isValid: boolean) => void;
}

const AccountForm: React.FC<AccountFormProps> = ({
  profile,
  editing,
  onProfileChange,
  onRootChange,
  onSave,
  onImageChange,
  currentImageFile,
  onClearProfilePicture,
  onBirthDateValidationChange,
    onLocationDataChange
}) => {
  const [isNameValid, setIsNameValid] = useState(true);

  // State to store all available games fetched from the API
  const [games, setGames] = useState<Game[]>([]);
  // State to store the IDs of games currently selected by the user (managed as a Set for efficient lookups)
  const [selectedGameIds, setSelectedGameIds] = useState<Set<number>>(new Set());

  // Effect to load games from API and initialize selectedGameIds when profile.interestedGames changes
  useEffect(() => {
    console.log("AccountForm: useEffect to load games and initialize selectedGameIds triggered.");
    axios.get<Game[]>("http://localhost:8080/games")
      .then((response) => {
        const fetchedGames = response.data;
        setGames(fetchedGames);

        const newSelectedIds = new Set<number>();
        const userInterestedGames = profile.interestedGames || [];

        // Populate newSelectedIds based on the user's interested games, ensuring they exist in fetchedGames
        userInterestedGames.forEach((userGame) => {
          if (fetchedGames.some(fetchedGame => fetchedGame.id === userGame.id)) {
            newSelectedIds.add(userGame.id);
          }
        });

        // Compare the newly formed set of IDs with the current state to avoid unnecessary updates
        const areSetsEqual = selectedGameIds.size === newSelectedIds.size &&
                             Array.from(newSelectedIds).every(id => selectedGameIds.has(id));

        if (!areSetsEqual) {
          setSelectedGameIds(newSelectedIds);
          console.log("AccountForm: setSelectedGameIds called with a new set.");
        } else {
          console.log("AccountForm: selectedGameIds are already up to date.");
        }
      })
      .catch((error) => {
        console.error("Failed to load games", error);
      });
  }, [profile.interestedGames, selectedGameIds]); // Dependency on selectedGameIds ensures the comparison uses the latest state

  // Callback to toggle a game's selection status
  const toggleGame = useCallback((game: Game) => {
    setSelectedGameIds((prev) => {
      const newSetOfIds = new Set(prev); // Create a new Set from previous state
      if (newSetOfIds.has(game.id)) {
        newSetOfIds.delete(game.id); // If already selected, deselect it
      } else {
        newSetOfIds.add(game.id); // If not selected, select it
      }
      
      // Convert the Set of IDs back to an array of Game objects for the parent component
      const selectedGameObjects = Array.from(newSetOfIds).map(id => 
          games.find(g => g.id === id) // Find the full Game object from the 'games' list
      ).filter((g): g is Game => g !== undefined); // Filter out any undefined results

      // Call the parent's onRootChange to update the user's interestedGames in the draft profile
      console.log("toggleGame: Calling onRootChange for interestedGames.");
      onRootChange("interestedGames", selectedGameObjects);
      
      return newSetOfIds; // Return the new Set of IDs to update the state
    });
  }, [games, onRootChange]); // Dependencies: 'games' (to find Game objects) and 'onRootChange' (parent callback)

  // Memoized callback for profile changes to prevent re-creation on every render
  const handleProfileChangeInternal = useCallback((field: keyof User["profile"], value: any) => {
    onProfileChange(field, value);
  }, [onProfileChange]);

  // Memoized callback for root-level user changes
  const handleRootChangeInternal = useCallback((field: keyof User, value: any) => {
    onRootChange(field, value);
  }, [onRootChange]);

  // Memoized callback for name input validation
  const handleNameValidate = useCallback((isValid: boolean) => {
    setIsNameValid(isValid);
  }, []);

  // Memoized callback for birth date validation
  const handleBirthDateValidationChange = useCallback((isValid: boolean) => {
    onBirthDateValidationChange(isValid);
  }, [onBirthDateValidationChange]);

  // Memoized callback for description textarea changes
  const handleDescriptionChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onProfileChange("description", e.target.value);
  }, [onProfileChange]);

  // Memoized callback for saving changes
  const handleSaveInternal = useCallback(() => {
    if (!isNameValid ) return; // Add other necessary client-side validations here
    onSave();
  }, [isNameValid, onSave]);

    const handleLocationChange = useCallback((value: string, placeId?: string, coordinates?: any, isGpsUsed?: boolean) => {
        onProfileChange("location", value);

        if (placeId && coordinates) {
            const newLocationData = {
                placeId,
                coordinates,
                isGpsUsed: isGpsUsed || false
            };
            onLocationDataChange?.(newLocationData);
        } else if (value === '') {
            onLocationDataChange?.(undefined);
        }
    }, [onProfileChange, onLocationDataChange]);
  return (
    <Form>
      <Form.Group className="mb-3">
        <Form.Label>Username</Form.Label>
        <Form.Control
          type="text"
          value={profile.username || ""}
          disabled // Username is usually not editable
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Email</Form.Label>
        <Form.Control
          type="email"
          value={profile.email || ""}
          disabled // Email is usually not editable
        />
      </Form.Group>

      <BirthDateSelector
        birthDate={profile.profile.birthDate || ""}
        onChange={handleProfileChangeInternal.bind(null, "birthDate")}
        disabled={!editing}
        onValidate={handleBirthDateValidationChange}
        minAge={18}
        maxAge={120}
      />

      <NameInput
        value={profile.profile.name || ""}
        onChange={handleProfileChangeInternal.bind(null, "name")}
        onValidate={handleNameValidate}
        disabled={!editing}
      />

      <GenderSelector
        selected={profile.profile.gender || "man"}
        onChange={handleProfileChangeInternal.bind(null, "gender")}
        isEditable={editing}
      />

      <HeightSet
        height={profile.profile.height || 150}
        setHeight={handleProfileChangeInternal.bind(null, "height")}
        isEditable={editing}
      />

        <LocationSelector
            value={profile.profile.location || ""}
            onChange={handleLocationChange}
            isEditable={editing}
            locationData={profile.locationData}
        />
      <RadiusSelector
        radius={profile.radius || 5000}
        setRadius={handleRootChangeInternal.bind(null, "radius")}
        isEditable={editing}
      />

      <PreferredGenderSelector
        selected={profile.interestedGenders || []}
        onChange={handleRootChangeInternal.bind(null, "interestedGenders")}
        isEditable={editing}
      />

      <Form.Group className="mb-3">
        <Form.Label>Description</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          value={profile.profile.description || ""}
          disabled={!editing}
          onChange={handleDescriptionChange}
        />
      </Form.Group>

      {/* GameSelector component, passing the Set of selected game IDs */}
      <GameSelector
        games={games}
        selectedGameIds={selectedGameIds}
        onToggle={toggleGame}
        disabled={!editing}
      />
      
      <ImageUpload
          image={currentImageFile}
          setImage={onImageChange}
          disabled={!editing}
          displayed={editing}
          onClearImage={onClearProfilePicture}
          currentProfilePicture={profile.profile.profilePicture}
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