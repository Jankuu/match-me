import React, { useState, useEffect } from "react";
import { Button } from "react-bootstrap";
import { Game } from "../../dto/Game";
import apiClient from "../../utils/apiClient";

interface GameSelectorProps {
  selectedGames: Game[];
  onChange: (games: Game[]) => void;
  isEditable?: boolean;
}

const GameSelector: React.FC<GameSelectorProps> = ({ 
  selectedGames = [], 
  onChange, 
  isEditable = true 
}) => {
  const [games, setGames] = useState<Game[]>([]);
  const [selectedGameSet, setSelectedGameSet] = useState<Set<number>>(
    new Set(selectedGames.map(game => game.id))
  );

  useEffect(() => {
    // Fetch games from the backend
    apiClient
      .get<Game[]>("/games")
      .then((response) => {
        setGames(response.data);
      })
      .catch((error) => {
        console.error("Error fetching games:", error);
      });
  }, []);

  // Update selectedGameIds when selectedGames prop changes
  useEffect(() => {
    setSelectedGameSet(new Set(selectedGames.map(game => game.id)));
  }, [selectedGames]);

  const toggleGame = (game: Game) => {
    if (!isEditable) return;

    setSelectedGameSet((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(game.id)) {
        newSet.delete(game.id);
      } else {
        newSet.add(game.id);
      }
      
      // Convert back to Game objects for the onChange callback
      const updatedGames = games.filter(game => newSet.has(game.id));
      onChange(updatedGames);
      
      return newSet;
    });
  };

  return (
    <div className="mb-3">
      <label className="form-label">
        Interested Games {isEditable && <span style={{ color: "red" }}>*</span>}
      </label>
      <div className="scrollContainer">
        {games.map((game) => (
          <Button
            key={game.id}
            onClick={() => toggleGame(game)}
            style={{
              backgroundColor: selectedGameSet.has(game.id)
                ? "#4caf50"
                : "#f0f0f0",
              color: selectedGameSet.has(game.id) ? "white" : "black",
              border: "1px solid #ccc",
              borderRadius: "5px",
              cursor: isEditable ? "pointer" : "default",
              opacity: isEditable ? 1 : 0.7,
              margin: "0.25rem",
            }}
            className="gameButton"
            disabled={!isEditable}
          >
            {game.name}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default GameSelector;