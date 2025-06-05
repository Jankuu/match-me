import React, { useEffect, useRef, useState } from "react";
import { Form, Button, InputGroup } from "react-bootstrap";
import { CheckCircleFill, XCircleFill, GeoAltFill } from "react-bootstrap-icons";

// Define the type for coordinates
type Coordinates = {
    lat: number;
    lng: number;
};

// Define the props for the LocationSelector component
type Props = {
    value: string; // The current value of the location input
    onChange: ( // Callback function to handle location changes
        value: string,
        placeId?: string,
        coordinates?: Coordinates,
        isGpsUsed?: boolean
    ) => void;
    isEditable?: boolean; // Determines if the input is editable (defaults to true)
    locationData?: { // Optional initial location data
        placeId: string;
        coordinates: Coordinates;
        isGpsUsed: boolean;
    };
};

const LocationSelector = ({ value, onChange, isEditable = true, locationData }: Props) => {
    // Create a ref for the input element to directly access its DOM properties
    const inputRef = useRef<HTMLInputElement>(null);
    // Create a ref for the Google Maps Autocomplete object
    const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
    // State to manage the loading status when fetching location via GPS
    const [isLocationFetching, setIsLocationFetching] = useState(false);
    // State to track if the selected location is valid
    const [isValidLocation, setIsValidLocation] = useState(value.length > 0 || (locationData !== undefined));

    // Effect hook to initialize Google Maps Autocomplete
    useEffect(() => {
        // Ensure Google Maps API and input ref are available
        if (!window.google || !inputRef.current) return;

        // Initialize Autocomplete on the input element
        autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
            types: ["(cities)"], // Restrict predictions to cities
            componentRestrictions: { country: "ee" }, // Restrict to Estonia
        });

        // Add a listener for when a place is selected from the autocomplete suggestions
        autocompleteRef.current.addListener("place_changed", () => {
            const place = autocompleteRef.current!.getPlace(); // Get the selected place details
            const address = place.formatted_address || place.name || ""; // Extract formatted address or name

            // Check if place has geometry and location data
            if (place.geometry && place.geometry.location) {
                const lat = place.geometry.location.lat(); // Get latitude
                const lng = place.geometry.location.lng(); // Get longitude
                const placeId = place.place_id; // Get place ID

                setIsValidLocation(true); // Mark location as valid
                //onChange(address, placeId, { lat, lng }, false); // Update parent component with selected location data (not GPS-used)
                onChange(address, placeId, { lat, lng }, true); // Until without gps login is fixed
            } else {
                setIsValidLocation(false); // Mark location as invalid
                onChange(address); // Update parent component with just the address (no valid location data)
            }
        });
    }, []); // Empty dependency array ensures this runs only once on mount

    // Function to get the user's current location using Geolocation API
    const getLocation = () => {
        // Check if the browser supports Geolocation
        if (navigator.geolocation) {
            setIsLocationFetching(true); // Set fetching state to true

            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords; // Get latitude and longitude from position

                    const geocoder = new google.maps.Geocoder(); // Create a new Geocoder instance
                    const latLng = new google.maps.LatLng(latitude, longitude); // Create LatLng object

                    try {
                        // Reverse geocode the coordinates to get address details
                        const results = await new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
                            geocoder.geocode({ location: latLng }, (results, status) => {
                                if (status === google.maps.GeocoderStatus.OK && results) {
                                    resolve(results); // Resolve with results if successful
                                } else {
                                    reject("Geocoder failed or no results found"); // Reject on failure
                                }
                            });
                        });

                        // Find the city result from the geocoder results
                        const cityResult = results.find(result => result.types.includes("locality"));
                        if (cityResult) {
                            const cityName = cityResult.formatted_address || ''; // Get city name
                            const placeId = cityResult.place_id; // Get place ID
                            const coordinates = { lat: latitude, lng: longitude }; // Use current GPS coordinates

                            inputRef.current!.value = cityName; // Set input value to city name
                            setIsValidLocation(true); // Mark location as valid
                            onChange(cityName, placeId, coordinates, true); // Update parent component with GPS-obtained location data

                            // If autocomplete is active, set its bounds to the current location
                            if (autocompleteRef.current) {
                                autocompleteRef.current.setBounds(new google.maps.LatLngBounds(latLng));
                            }
                        } else {
                            setIsValidLocation(false); // Mark location as invalid if city not found
                        }
                    } catch (error) {
                        console.error(error); // Log any errors during geocoding
                        setIsValidLocation(false); // Mark location as invalid on error
                    } finally {
                        setIsLocationFetching(false); // Reset fetching state
                    }
                },
                (error) => {
                    console.error(error); // Log errors from geolocation
                    setIsLocationFetching(false); // Reset fetching state on error
                }
            );
        } else {
            alert("Geolocation is not supported by this browser."); // Alert if geolocation is not supported
        }
    };

    // Effect hook to update validity when the input value changes
    useEffect(() => {
        if (!value) {
            setIsValidLocation(false); // If value is empty, location is not valid
        }
    }, [value]); // Rerun when 'value' prop changes

    return (
        <Form.Group className="mb-3">
            <Form.Label>
                Location
                {/* {isEditable && <span style={{ color: "red" }}>*</span>} */}
            </Form.Label>
            <InputGroup>
                <Form.Control
                    type="text"
                    ref={inputRef} // Assign ref to the input element
                    value={value} // Controlled component value
                    disabled={!isEditable} // Disable if not editable
                    // required={isEditable} // (Commented out)
                    isInvalid={!isValidLocation && value.length > 0} // Show invalid state if not valid and input has value
                    onChange={(e) => {
                        const newValue = e.target.value;
                        if (newValue === '') {
                            setIsValidLocation(false); // If input is cleared, set invalid
                            // clear location data
                            onChange('', undefined, undefined, undefined); // Clear all location data in parent
                        } else {
                            onChange(newValue); // Update parent component with new input value
                        }
                    }}
                />

                {isEditable && ( // Render GPS button only if editable
                    <Button
                        variant="outline-secondary"
                        onClick={getLocation} // Call getLocation on click
                        disabled={isLocationFetching} // Disable button while fetching
                    >
                        {isLocationFetching ? "..." : <GeoAltFill />} {/* Show spinner or GPS icon */}
                    </Button>
                )}

                {value.length > 0 && ( // Show validity icon only if input has value
                    <InputGroup.Text>
                        {isValidLocation ? ( // Render check or cross icon based on validity
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