import React, { useEffect, useState } from "react";
import { Range, getTrackBackground } from "react-range";
import Form from "react-bootstrap/Form";

const MIN = 18;
const MAX = 120;

type AgeRangeSliderProps = {
    userAge: number | null;
    onChange: (range: [number, number]) => void;
};

const AgeRangeSlider: React.FC<AgeRangeSliderProps> = ({ userAge, onChange }) => {
    const [values, setValues] = useState<[number, number]>([MIN, MAX]);

    useEffect(() => {
        if (userAge) {
            const lower = Math.max(MIN, userAge - 2);
            const upper = Math.min(MAX, userAge + 2);
            setValues([lower, upper]);
            onChange([lower, upper]);
        }
    }, [userAge]);

    const handleChange = (vals: number[]) => {
        const newRange: [number, number] = [vals[0], vals[1]];
        setValues(newRange);
        onChange(newRange);
    };

    return (
        userAge && (
            <Form.Group className="mb-4">
                <Form.Label>
                    Desired Age Range: {values[0]} – {values[1]}
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
                        values={values}
                        step={1}
                        min={MIN}
                        max={MAX}
                        onChange={handleChange}
                        renderTrack={({ props, children }) => {
                            const { key, ...rest } = props as any;  
                            return (
                            <div
                                key = {key}
                                {...rest}
                                // Can make it separetaly
                                style={{
                                    ...rest.style,
                                    height: "6px",
                                    width: "100%",
                                    background: getTrackBackground({
                                        values,
                                        colors: ["#ccc", "#198754", "#ccc"],
                                        min: MIN,
                                        max: MAX
                                    }),
                                    borderRadius: "4px"
                                }}
                            >
                                {children}
                            </div>
                        )}}
                        renderThumb={({ props, index }) => {
                            const { key, ...rest } = props as any;  
                            return (
                            <div
                                key={key}
                                {...rest}
                                style={{
                                    height: "20px",
                                    width: "20px",
                                    borderRadius: "50%",
                                    backgroundColor: "#198754",
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    boxShadow: "0 0 2px rgba(0,0,0,0.5)",
                                    ...props.style
                                }}
                            >
                                <span style={{ color: "white", fontSize: "11px" }}>
                                    {values[index]}
                                </span>
                            </div>
                        )}}
                    />
                </div>
            </Form.Group>
        )
    );
};

export default AgeRangeSlider;
