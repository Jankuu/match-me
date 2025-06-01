import React, { useEffect, useRef, useState } from "react";
import { Form, Button, InputGroup } from "react-bootstrap";
import { CheckCircleFill, XCircleFill, GeoAltFill } from "react-bootstrap-icons";

type Coordinates = {
    lat: number;
    lng: number;
};

type Props = {
    value: string;
    onChange: (
        value: string,
        placeId?: string,
        coordinates?: Coordinates,
        isGpsUsed?: boolean
    ) => void;
    isEditable?: boolean;
    locationData?: {
        placeId: string;
        coordinates: Coordinates;
        isGpsUsed: boolean;
    };
};

const LocationSelector = ({ value, onChange, isEditable = true, locationData }: Props) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
    const [isLocationFetching, setIsLocationFetching] = useState(false);
    const [isValidLocation, setIsValidLocation] = useState(value.length > 0 || (locationData !== undefined));

    useEffect(() => {
        if (!window.google || !inputRef.current) return;

        autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
            types: ["(cities)"], // check for coordinates
            componentRestrictions: { country: "ee" },
        });

        autocompleteRef.current.addListener("place_changed", () => {
            const place = autocompleteRef.current!.getPlace();
            const address = place.formatted_address || place.name || "";

            if (place.geometry && place.geometry.location) {
                const lat = place.geometry.location.lat();
                const lng = place.geometry.location.lng();
                const placeId = place.place_id;

                setIsValidLocation(true);
                onChange(address, placeId, { lat, lng }, false);
            } else {
                setIsValidLocation(false);
                onChange(address);
            }
        });
    }, []);

    const getLocation = () => {
        if (navigator.geolocation) {
            setIsLocationFetching(true);

            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;

                    const geocoder = new google.maps.Geocoder();
                    const latLng = new google.maps.LatLng(latitude, longitude);

                    try {
                        const results = await new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
                            geocoder.geocode({ location: latLng }, (results, status) => {
                                if (status === google.maps.GeocoderStatus.OK && results) {
                                    resolve(results);
                                } else {
                                    reject("Geocoder failed or no results found");
                                }
                            });
                        });

                        const cityResult = results.find(result => result.types.includes("locality"));
                        if (cityResult) {
                            const cityName = cityResult.formatted_address || '';
                            const placeId = cityResult.place_id;
                            const coordinates = { lat: latitude, lng: longitude };

                            inputRef.current!.value = cityName;
                            setIsValidLocation(true);
                            onChange(cityName, placeId, coordinates, true);

                            if (autocompleteRef.current) {
                                autocompleteRef.current.setBounds(new google.maps.LatLngBounds(latLng));
                            }
                        } else {
                            setIsValidLocation(false);
                        }
                    } catch (error) {
                        console.error(error);
                        setIsValidLocation(false);
                    } finally {
                        setIsLocationFetching(false);
                    }
                },
                (error) => {
                    console.error(error);
                    setIsLocationFetching(false);
                }
            );
        } else {
            alert("Geolocation is not supported by this browser.");
        }
    };

    useEffect(() => {
        if (!value) {
            setIsValidLocation(false);
        }
    }, [value]);

    return (
        <Form.Group className="mb-3">
            <Form.Label>
                Location {isEditable && <span style={{ color: "red" }}>*</span>}
            </Form.Label>
            <InputGroup>
                <Form.Control
                    type="text"
                    ref={inputRef}
                    value={value}
                    disabled={!isEditable}
                    // required={isEditable}
                    isInvalid={!isValidLocation && value.length > 0}
                    onChange={(e) => {
                        const newValue = e.target.value;
                        if (newValue === '') {
                            setIsValidLocation(false);
                            // clear location data
                            onChange('', undefined, undefined, undefined);
                        } else {
                            onChange(newValue);
                        }
                    }}
                />

                {isEditable && (
                    <Button
                        variant="outline-secondary"
                        onClick={getLocation}
                        disabled={isLocationFetching}
                    >
                        {isLocationFetching ? "..." : <GeoAltFill />}
                    </Button>
                )}

                {value.length > 0 && (
                    <InputGroup.Text>
                        {isValidLocation ? (
                            <CheckCircleFill color="green" />
                        ) : (
                            <XCircleFill color="red" />
                        )}
                    </InputGroup.Text>
                )}
            </InputGroup>
        </Form.Group>
    );
};

export default LocationSelector;
