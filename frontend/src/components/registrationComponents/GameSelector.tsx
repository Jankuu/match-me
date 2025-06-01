// components/register/GameSelector.tsx

import { Button } from "react-bootstrap";
import { Game } from "../../dto/Game";
import "../../styles/GameSelector.css";

type Props = {
    games: Game[];
    selectedGames: Set<Game>;
    onToggle: (game: Game) => void;
};

const GameSelector = ({ games, selectedGames, onToggle }: Props) => {
    return (
        <div className="scrollContainer d-flex flex-wrap gap-2 mb-3 p-2 border rounded overflow-auto">
            {games.map((game) => {
                const isSelected = selectedGames.has(game);
                return (
                    <Button
                        key={game.name}
                        variant={isSelected ? "success" : "outline-primary"}
                        onClick={() => onToggle(game)}
                        className="game-button"
                    >
                        {game.name}
                    </Button>
                );
            })}
        </div>
    );
};

export default GameSelector;
