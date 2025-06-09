import React, { useState, useEffect, useCallback } from 'react';
import { Form, InputGroup, Button, Alert } from 'react-bootstrap';
import { FaMapMarkerAlt, FaLocationArrow } from 'react-icons/fa';
import { Coordinates } from '../../types/Cordinates';

// Assuming you have a Google Maps API key

interface LocationSelectorProps {
    value: string; // Current city name (maps to User.cityName)
    lat: number | null; // Current latitude (maps to User.lat)
    lng: number | null; // Current longitude (maps to User.lng)
    googlePlaceId: string | null; // Current Google Place ID (maps to User.googlePlaceId)
    isGpsUser: boolean | null; // Is GPS used (maps to User.isGpsUsed)
    onChange: (
        address: string,
        placeId: string | null,         // Explicitly string | null
        coordinates: Coordinates | null, // Explicitly Coordinates | null
        isGpsUser: boolean | null        // Explicitly boolean | null
    ) => void;
    isEditable?: boolean;
    isInvalid?: boolean; // For validation feedback
}

const LocationSelector: React.FC<LocationSelectorProps> = ({
    value, lat, lng, googlePlaceId, isGpsUser: isGpsUsed, onChange, isEditable = true, isInvalid
}) => {
    const [inputValue, setInputValue] = useState(value);
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [geocoder, setGeocoder] = useState<google.maps.Geocoder | null>(null);
    const [placesService, setPlacesService] = useState<google.maps.places.PlacesService | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Initialize Google Maps services once
    useEffect(() => {
        if (!window.google) {
            setError("Google Maps API not loaded. Please check your script tag in index.html.");
            return;
        }
        if (!geocoder) {
            setGeocoder(new window.google.maps.Geocoder());
        }
        if (!placesService) {
            const dummyDiv = document.createElement('div');
            setPlacesService(new window.google.maps.places.PlacesService(dummyDiv));
        }
    }, [geocoder, placesService]);

    // Synchronize internal state with external prop changes (e.g., when profile loads)
    useEffect(() => {
        setInputValue(value);
    }, [value, lat, lng, googlePlaceId, isGpsUsed]);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const newInputValue = e.target.value;
        setInputValue(newInputValue);
        setError(null);

        if (newInputValue.length > 2 && geocoder && placesService) {
            const request = {
                input: newInputValue,
                types: ['(cities)'], // Restrict to cities
                componentRestrictions: { country: 'ee' } // Restrict to Estonia, adjust as needed
            };
            const autocompleteService = new window.google.maps.places.AutocompleteService();
            autocompleteService.getPlacePredictions(request, (predictions, status) => {
                if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
                    setSuggestions(predictions);
                } else {
                    setSuggestions([]);
                    // If no predictions, clear current selection.
                    onChange('', null, null, null);
                }
            });
        } else {
            setSuggestions([]);
            // When input is cleared or too short, also clear current location selection
            onChange('', null, null, null);
        }
    }, [geocoder, placesService, onChange]);

    const handleSuggestionClick = useCallback((suggestion: any) => {
        setInputValue(suggestion.description);
        setSuggestions([]);
        setError(null);

        if (geocoder) {
            geocoder.geocode({ 'placeId': suggestion.place_id }, (results, status) => {
                if (status === window.google.maps.GeocoderStatus.OK && results && results[0]) {
                    const location = results[0].geometry.location;
                    const coords: Coordinates = { lat: location.lat(), lng: location.lng() };
                    onChange(suggestion.description, suggestion.place_id, coords, false);
                } else {
                    setError('Error getting coordinates for this location.');
                    onChange(suggestion.description, null, null, false); // Pass null for placeId and coords on error
                }
            });
        }
    }, [onChange, geocoder]);

    const handleGpsLocation = useCallback(() => {
        if (navigator.geolocation && isEditable) {
            setError(null);
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const coords: Coordinates = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    };
                    if (geocoder) {
                        geocoder.geocode({ 'location': coords }, (results, status) => {
                            if (status === window.google.maps.GeocoderStatus.OK && results && results[0]) {
                                const cityComponent = results[0].address_components.find((comp: any) =>
                                    comp.types.includes('locality') || comp.types.includes('administrative_area_level_1') || comp.types.includes('country')
                                );
                                const cityName = cityComponent ? cityComponent.long_name : results[0].formatted_address;
                                onChange(cityName, results[0].place_id, coords, true);
                                setInputValue(cityName);
                                setSuggestions([]);
                            } else {
                                setError('Could not reverse geocode your GPS location. Displaying raw coordinates.');
                                onChange('', null, coords, true); // Pass null for placeId if reverse geocode fails
                                setInputValue(`Lat: ${coords.lat.toFixed(4)}, Lng: ${coords.lng.toFixed(4)}`);
                            }
                        });
                    }
                },
                (err) => {
                    setError('Error getting GPS location: ' + err.message);
                    onChange('', null, null, false); // Pass null for all optional values on error
                    setInputValue('');
                }
            );
        } else {
            setError("Geolocation is not supported by your browser or editing is disabled.");
        }
    }, [onChange, geocoder, isEditable]);

    return (
        <Form.Group className="mb-3">
            <Form.Label>Location {isEditable && (<span style={{ color: "red" }}>*</span>)}</Form.Label>
            <InputGroup hasValidation>
                <Form.Control
                    type="text"
                    placeholder="Enter city name"
                    value={inputValue}
                    onChange={handleInputChange}
                    disabled={!isEditable}
                    isInvalid={isInvalid}
                />
                {isEditable && (
                    <Button variant="outline-secondary" onClick={handleGpsLocation} disabled={!isEditable}>
                        <FaLocationArrow /> Use GPS
                    </Button>
                )}
                <Form.Control.Feedback type="invalid">
                    Invalid location. Please select from suggestions or use GPS.
                </Form.Control.Feedback>
            </InputGroup>

            {error && <Alert variant="danger" className="mt-2">{error}</Alert>}

            {suggestions.length > 0 && isEditable && (
                <ul className="list-group mt-2">
                    {suggestions.map((suggestion) => (
                        <li
                            key={suggestion.place_id}
                            className="list-group-item list-group-item-action"
                            onClick={() => handleSuggestionClick(suggestion)}
                            style={{ cursor: 'pointer' }}
                        >
                            <FaMapMarkerAlt className="me-2 text-primary" />
                            {suggestion.description}
                        </li>
                    ))}
                </ul>
            )}
        </Form.Group>
    );
};

export default LocationSelector;