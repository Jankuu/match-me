import React, { useEffect, useState } from "react"; // Importing React, useEffect for side effects, useState for component state
import { Range, getTrackBackground } from "react-range"; // Importing Range component and utility for track background from react-range
import Form from "react-bootstrap/Form"; // Importing Form component from React-Bootstrap

// Define the minimum and maximum age values for the range slider
const MIN = 18;
const MAX = 120;

/**
 * Defines the props for the AgeRangeSelector component.
 * @property {(range: [number, number]) => void} onChange - Callback function to update the selected age range in the parent component.
 * @property {[number, number] | undefined} selectedRange - The currently selected age range. If provided, this will be used for initialization.
 * @property {boolean} [isEditable=true] - Whether the component is editable.
 */
type AgeRangeSliderProps = {
    onChange: (range: [number, number]) => void;
    selectedRange?: [number, number];
    isEditable?: boolean;
};

/**
 * AgeRangeSelector component.
 * This component provides a dual-thumb range slider to select a desired age range.
 * It can optionally initialize the range based on the `selectedRange` prop.
 */
const AgeRangeSelector: React.FC<AgeRangeSliderProps> = ({ 
    onChange, 
    selectedRange, 
    isEditable = true 
}) => {
    // State to hold the current selected range values for the slider.
    // Initialized to the full MIN-MAX range.
    const [values, setValues] = useState<[number, number]>(
        selectedRange || [MIN, MAX]
    );

    /**
     * useEffect hook to initialize the slider's range based on `selectedRange`.
     * This effect runs when `selectedRange` changes.
     * If `selectedRange` is provided, it will use that. Otherwise, it will use the default range.
     */
    useEffect(() => {
        if (selectedRange) {
            // If selectedRange is provided, use it directly
            setValues(selectedRange);
            // No need to call onChange here as it would trigger unnecessary updates
        } else {
            // If no selectedRange is provided, use the default range
            setValues([MIN, MAX]);
            // Notify the parent component of the initial range
            onChange([MIN, MAX]);
        }
        // Dependencies: selectedRange, onChange
    }, [selectedRange, onChange]);

    /**
     * Handler for when the slider's values change.
     * @param vals An array of numbers representing the current positions of the slider thumbs.
     */
    const handleChange = (vals: number[]) => {
        // If the component is not editable, don't update the values
        if (!isEditable) return;

        // Cast the array to a tuple to match the expected type for `values` and `onChange`.
        const newRange: [number, number] = [vals[0], vals[1]];
        // Update the local state
        setValues(newRange);
        // Notify the parent component of the new range
        onChange(newRange);
    };

    return (
        <Form.Group className="mb-4">
            <Form.Label>
                Desired Age Range: {values[0]} – {values[1]} {/* Displays the currently selected range */}
            </Form.Label>
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    flexWrap: "wrap",
                    marginTop: 20
                }}
            >
                <Range
                    values={values} // Binds the slider to the local 'values' state
                    step={1} // The step increment for the slider (e.g., 1 year)
                    min={MIN} // Minimum value of the range
                    max={MAX} // Maximum value of the range
                    onChange={handleChange} // Handler for slider value changes
                    renderTrack={({ props, children }) => {
                        // Destructure props, explicitly casting to `any` for `key` as it's not directly in React.HTMLAttributes
                        const { key, ...rest } = props as any;
                        return (
                            <div
                                key={key}
                                {...rest} // Spread the rest of the props (e.g., style, ref) to the div
                                // Inline style for the track, using `getTrackBackground` for dynamic coloring
                                style={{
                                    ...rest.style, // Preserve original style from props
                                    height: "6px",
                                    width: "100%",
                                    background: getTrackBackground({
                                        values,
                                        colors: ["#ccc", isEditable ? "#198754" : "#6c757d", "#ccc"], // Gray before, green/gray between, gray after thumbs
                                        min: MIN,
                                        max: MAX
                                    }),
                                    borderRadius: "4px",
                                    opacity: isEditable ? 1 : 0.7, // Reduce opacity when not editable
                                    cursor: isEditable ? "pointer" : "not-allowed" // Change cursor when not editable
                                }}
                            >
                                {children} {/* Render the thumbs and other track elements */}
                            </div>
                        );
                    }}
                    renderThumb={({ props, index }) => {
                        // Destructure props for the thumb, explicitly casting to `any` for `key`
                        const { key, ...rest } = props as any;
                        return (
                            <div
                                key={key}
                                {...rest} // Spread the rest of the props (e.g., style, ref) to the div
                                // Inline style for each thumb
                                style={{
                                    height: "20px",
                                    width: "20px",
                                    borderRadius: "50%",
                                    backgroundColor: isEditable ? "#198754" : "#6c757d", // Green color for editable, gray for non-editable
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    boxShadow: "0 0 2px rgba(0,0,0,0.5)",
                                    opacity: isEditable ? 1 : 0.7, // Reduce opacity when not editable
                                    cursor: isEditable ? "grab" : "not-allowed", // Change cursor when not editable
                                    ...props.style // Preserve original style from props
                                }}
                            >
                                {/* Display the current value of the thumb inside the thumb circle */}
                                <span style={{ color: "white", fontSize: "11px" }}>
                                    {values[index]}
                                </span>
                            </div>
                        );
                    }}
                />
            </div>
        </Form.Group>
    )
};

export default AgeRangeSelector; // Export the component
