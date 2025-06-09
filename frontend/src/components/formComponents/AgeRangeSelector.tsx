import React, { useEffect, useState } from "react"; // Importing React, useEffect for side effects, useState for component state
import { Range, getTrackBackground } from "react-range"; // Importing Range component and utility for track background from react-range
import Form from "react-bootstrap/Form"; // Importing Form component from React-Bootstrap

// Define the minimum and maximum age values for the range slider
const MIN = 18;
const MAX = 120;

/**
 * Defines the props for the AgeRangeSelector component.
 * @property {number | null} userAge - The age of the current user. If provided, the slider will initialize around this age.
 * @property {(range: [number, number]) => void} onChange - Callback function to update the selected age range in the parent component.
 */
type AgeRangeSliderProps = {
    userAge: number | null;
    onChange: (range: [number, number]) => void;
};

/**
 * AgeRangeSelector component.
 * This component provides a dual-thumb range slider to select a desired age range.
 * It can optionally initialize the range based on the `userAge` prop.
 */
const AgeRangeSelector: React.FC<AgeRangeSliderProps> = ({ userAge, onChange }) => {
    // State to hold the current selected range values for the slider.
    // Initialized to the full MIN-MAX range.
    const [values, setValues] = useState<[number, number]>([MIN, MAX]);

    /**
     * useEffect hook to initialize the slider's range based on `userAge`.
     * This effect runs only when `userAge` changes.
     * It sets the range to `userAge - 2` to `userAge + 2`, clamped within MIN and MAX.
     */
    useEffect(() => {
        if (userAge) { // Check if userAge is provided (not null)
            // Clamp userAge within the allowed MIN-MAX range
            if (userAge > MAX) {
                userAge = MAX;
            } else if (userAge < MIN) {
                userAge = MIN;
            }

            // Calculate the lower and upper bounds for the initial range,
            // ensuring they don't go below MIN or above MAX.
            const lower = Math.max(MIN, userAge - 2);
            const upper = Math.min(MAX, userAge + 2);

            // Update the local state with the new range
            setValues([lower, upper]);
            // Notify the parent component of the initial range
            onChange([lower, upper]);
        } else {
            // Update the local state with the default range
            setValues([MIN, MAX]);
            // Notify the parent component of the initial range
            onChange([MIN, MAX]);
        }
        // Dependencies: userAge. `onChange` is also a dependency for completeness,
        // though it's typically stable in parent components like RegisterForm.
    }, [userAge, onChange]);

    /**
     * Handler for when the slider's values change.
     * @param vals An array of numbers representing the current positions of the slider thumbs.
     */
    const handleChange = (vals: number[]) => {
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
                                        colors: ["#ccc", "#198754", "#ccc"], // Gray before, green between, gray after thumbs
                                        min: MIN,
                                        max: MAX
                                    }),
                                    borderRadius: "4px"
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
                                    backgroundColor: "#198754", // Green color for the thumb
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    boxShadow: "0 0 2px rgba(0,0,0,0.5)",
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