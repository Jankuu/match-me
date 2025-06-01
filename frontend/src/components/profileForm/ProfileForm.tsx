import React, { useState, useEffect } from "react";
import { Form, Button } from "react-bootstrap";
import { User } from "../../types/User";
import { Game } from "../../dto/Game";
import HeightSet from "../registrationComponents/HeightSet";
import GenderSelector from "../registrationComponents/GenderSelection";
import LocationSelector from "../registrationComponents/LocationSelector";
import apiClient from "../../utils/apiClient";

interface ProfileFormProps {
    profile: User;
    editing: boolean;
    onChange: (field: keyof User["profile"], value: any) => void;
    onGameChange?: (games: Game[]) => void;
    onSave: () => void;
    onLocationDataChange?: (locationData: any) => void;
}

const ProfileForm: React.FC<ProfileFormProps> = ({
                                                     profile,
                                                     editing,
                                                     onChange,
                                                     onGameChange,
                                                     onSave,
                                                     onLocationDataChange
                                                 }) => {
    const [height, setHeight] = useState<number>(profile.profile.height);
    const [gender, setGender] = useState<string>(profile.profile.gender);


    const [games, setGames] = useState<Game[]>([]);
    const [selectedGames, setSelectedGames] = useState<Set<Game>>(
        new Set(profile.interestedGames || [])
    );

    useEffect(() => {
        apiClient
            .get<Game[]>("/games")
            .then((response) => {
                setGames(response.data);
            })
            .catch((error) => {
                console.error("Error fetching games:", error);
            });
    }, []);


    useEffect(() => {
        setSelectedGames(new Set(profile.interestedGames || []));
    }, [profile.interestedGames]);

    const toggleGame = (game: Game) => {
        if (!editing || !onGameChange) return;

        setSelectedGames((prev) => {
            const newSet = new Set(prev);
            if (Array.from(newSet).some(g => g.id === game.id)) {
                newSet.delete(game);
            } else {
                newSet.add(game);
            }
            return newSet;
        });

        setHasGameSelectionChanged(true);
    };

    const [hasGameSelectionChanged, setHasGameSelectionChanged] = useState(false);

    useEffect(() => {
        if (onGameChange && hasGameSelectionChanged) {
            const updatedGames = Array.from(selectedGames);
            onGameChange(updatedGames);
            setHasGameSelectionChanged(false);
        }
    }, [selectedGames, onGameChange, hasGameSelectionChanged]);

    return (
        <Form>
            <Form.Group className="mb-3">
                <Form.Label>Username</Form.Label>
                <Form.Control type="text" value={profile.username} disabled />
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control type="email" value={profile.email} disabled />
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label>Birth Date</Form.Label>
                <Form.Control type="date" value={profile.profile.birthDate} disabled />
            </Form.Group>

            <GenderSelector
                onChange={(value) => {
                    setGender(value);
                    onChange("gender", value);
                }}
                selected={gender}
                isEditable={editing}
            />
                <HeightSet height={height}
                           setHeight={(value) => {
                               setHeight(value);
                               onChange("height", value);
                           }}
                           isEditable={editing}/>

            <LocationSelector
                value={profile.profile.location || ""}
                onChange={(value, placeId, coordinates, isGpsUsed) => {
                    onChange("location", value);
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
            />

            <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                    as="textarea"
                    rows={3}
                    value={profile.profile.description}
                    disabled={!editing}
                    onChange={(e) => onChange("description", e.target.value)}
                />
            </Form.Group>

            {/* Game Selector */}
            {onGameChange && (
                <div className="mb-3">
                    <label className="form-label">
                        Interested Games {editing && <span style={{ color: "red" }}>*</span>}
                    </label>
                    <div className="scrollContainer">
                        {games.map((game) => (
                            <Button
                                key={game.id}
                                onClick={() => toggleGame(game)}
                                style={{
                                    backgroundColor: Array.from(selectedGames).some(g => g.id === game.id)
                                        ? "#4caf50"
                                        : "#f0f0f0",
                                    color: Array.from(selectedGames).some(g => g.id === game.id) ? "white" : "black",
                                    border: "1px solid #ccc",
                                    borderRadius: "5px",
                                    cursor: editing ? "pointer" : "default",
                                    opacity: editing ? 1 : 0.7,
                                    margin: "0.25rem",
                                }}
                                className="gameButton"
                                disabled={!editing}
                            >
                                {game.name}
                            </Button>
                        ))}
                    </div>
                </div>
            )}

            {editing && (
                <Button variant="success" onClick={onSave}>
                    Save Changes
                </Button>
            )}
        </Form>
    );
};

export default ProfileForm;
