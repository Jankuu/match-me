import React, { useState } from 'react';
import { Form, Button, Collapse } from 'react-bootstrap';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa'; // Import icons for chevrons
import { Game } from '../../dto/Game'; // Ensure the path is correct

interface GameSelectorProps {
    allGames: Game[]; // List of all available games
    selectedGameIds: Set<number>; // Set of IDs of selected games
    onToggle: (newSelectedGameIds: Set<number>) => void; // Callback for changing selected games
    disabled?: boolean; // Flag to disable the component
}

const GameSelector: React.FC<GameSelectorProps> = ({ allGames, selectedGameIds, onToggle, disabled }) => {
    // State to manage the collapse/expand status
    const [isOpen, setIsOpen] = useState(false);

    // Handler for checkbox changes
    const handleCheckboxChange = (gameId: number) => {
        const newSelected = new Set(selectedGameIds);
        if (newSelected.has(gameId)) {
            newSelected.delete(gameId);
        } else {
            newSelected.add(gameId);
        }
        onToggle(newSelected);
    };

    const selectedCount = selectedGameIds.size;

    return (
        <Form.Group className="mb-3">
            {/* Header with toggle button for the collapsible section */}
            <div className="d-flex justify-content-between align-items-center mb-2">
                <Form.Label className="mb-0">
                    Select Interested Games
                    {/* Display selected game count if any are chosen */}
                    {selectedCount > 0 && (
                        <span className="ms-2 badge bg-secondary">
                            {selectedCount} selected
                        </span>
                    )}
                </Form.Label>
                <Button
                    onClick={() => setIsOpen(!isOpen)} // Toggle collapse state on click
                    aria-controls="games-collapse-text" // Link to the collapsible content for accessibility
                    aria-expanded={isOpen} // Indicate current state for accessibility
                    variant="link" // Style button as a link
                    disabled={disabled} // Disable button if the component is disabled
                    className="p-0" // Remove default padding for a cleaner icon button
                >
                    {isOpen ? <FaChevronUp /> : <FaChevronDown />} {/* Show appropriate icon */}
                </Button>
            </div>

            {/* Collapsible content area */}
            <Collapse in={isOpen}>
                <div id="games-collapse-text">
                    <div style={{
                        maxHeight: '200px', // Maximum height for scrolling
                        overflowY: 'auto', // Enable vertical scrolling
                        border: '1px solid #ced4da', // Add a border for visual separation
                        borderRadius: '0.25rem', // Rounded corners
                        padding: '10px' // Internal padding
                    }}>
                        {allGames.length > 0 ? (
                            allGames.map((game) => (
                                <Form.Check
                                    key={game.id}
                                    type="checkbox"
                                    id={`game-checkbox-${game.id}`}
                                    label={game.name}
                                    checked={selectedGameIds.has(game.id)}
                                    onChange={() => handleCheckboxChange(game.id)}
                                    disabled={disabled} // Disable checkboxes if the component is disabled
                                    className="mb-1"
                                />
                            ))
                        ) : (
                            <p className="text-muted">No games available.</p>
                        )}
                    </div>
                </div>
            </Collapse>
        </Form.Group>
    );
};

export default GameSelector;