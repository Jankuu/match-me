import React from 'react'; // Import React for React.memo
import { Button } from "react-bootstrap";
import { Game } from "../../dto/Game";
import "../../styles/GameSelector.css";

type Props = {
    games: Game[];
    // Expects a Set of game IDs that are currently selected
    selectedGameIds: Set<number>;
    // Callback function when a game button is toggled
    onToggle: (game: Game) => void;
    // Boolean to disable the selector if not in editing mode
    disabled: boolean;
};

// Memoizing GameSelector to prevent unnecessary re-renders.
// It will only re-render if its props (games, selectedGameIds, onToggle, disabled) change.
const GameSelector = React.memo(({ games, selectedGameIds, onToggle, disabled }: Props) => {
    // Log the selected IDs for debugging purposes
    console.log("GameSelector rendered with selectedGameIds:", Array.from(selectedGameIds)); 

    return (
        <div className="scrollContainer d-flex flex-wrap gap-2 mb-3 p-2 border rounded overflow-auto">
            {games.map((game) => {
                // Determine if the current game is selected by checking its ID in the Set
                const isSelected = selectedGameIds.has(game.id);
                return (
                    <Button
                        key={game.id} // Use game.id as the key for stable rendering
                        variant={isSelected ? "success" : "outline-primary"} // 'success' for selected, 'outline-primary' otherwise
                        onClick={() => onToggle(game)} // Pass the full Game object back to the parent
                        className="game-button"
                        disabled={disabled}
                    >
                        {game.name}
                    </Button>
                );
            })}
        </div>
    );
});

export default GameSelector;