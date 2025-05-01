import React, { useEffect, useRef, useState } from "react";
import { Form, Button } from "react-bootstrap";

type Coordinates = {
    lat: number;
    lng: number;
};

type Props = {
    value: string;
    onChange: (
        value: string,
        placeId?: string,
        coordinates?: Coordinates
    ) => void;
    disabled: boolean;
};

const LocationSelector = ({ value, onChange, disabled }: Props) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
    const [isLocationFetching, setIsLocationFetching] = useState(false);

    useEffect(() => {
        if (!window.google || !inputRef.current) return;

        // Restricting the autocomplete to city types only
        autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current!, {
            types: ["(cities)"],  // Only cities
            componentRestrictions: { country: "ee" }, // Estonia
        });

        autocompleteRef.current.addListener("place_changed", () => {
            const place = autocompleteRef.current!.getPlace();
            const address = place.formatted_address || place.name || "";

            if (place.geometry && place.geometry.location) {
                const lat = place.geometry.location.lat();
                const lng = place.geometry.location.lng();
                const placeId = place.place_id;

                onChange(address, placeId, { lat, lng });
            } else {
                onChange(address);
            }
        });
    }, []);

    // Function to handle geolocation and reverse geocoding
    const getLocation = () => {
        if (navigator.geolocation) {
            setIsLocationFetching(true);

            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;

                    // Use Google Geocoding API to get the address based on coordinates
                    const geocoder = new google.maps.Geocoder();
                    const latLng = new google.maps.LatLng(latitude, longitude);

                    try {
                        const results = await new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
                            geocoder.geocode({ location: latLng }, (results, status) => {
                                if (status === google.maps.GeocoderStatus.OK && results) {
                                    resolve(results);
                                } else {
                                    reject('Geocoder failed or no results found');
                                }
                            });
                        });

                        // Find the result that contains "locality" type (city)
                        const cityResult = results.find(result => result.types.includes("locality"));
                        if (cityResult) {
                            const cityName = cityResult.formatted_address || '';
                            const placeId = cityResult.place_id;
                            const coordinates = { lat: latitude, lng: longitude };

                            // Update the state with the city only
                            onChange(cityName, placeId, coordinates);

                            // After getting the location, trigger autocomplete for address completion
                            if (autocompleteRef.current) {
                                inputRef.current!.value = cityName; // Set only the city name in the input
                                autocompleteRef.current.setBounds(new google.maps.LatLngBounds(latLng)); // Adjust bounds for autocomplete
                            }
                        }
                    } catch (error) {
                        console.error(error);
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

    return (
        <Form.Group className="mb-3">
            <Form.Label>
                Location <span style={{ color: "red" }}>*</span>
            </Form.Label>
            <Form.Control
                type="text"
                ref={inputRef}
                defaultValue={value}
                placeholder="Start typing your city"
                disabled={disabled}
                required
            />
            <Button
                variant="secondary"
                onClick={getLocation}
                disabled={isLocationFetching || disabled}
                className="mt-2"
            >
                {isLocationFetching ? "Locating..." : "Use My Location"}
            </Button>
        </Form.Group>
    );
};

export default LocationSelector;


// import React, { useEffect, useRef, useState } from "react";
// import { Form, Button } from "react-bootstrap";

// type Coordinates = {
//     lat: number;
//     lng: number;
// };

// type Props = {
//     value: string;
//     onChange: (
//         value: string,
//         placeId?: string,
//         coordinates?: Coordinates
//     ) => void;
//     disabled: boolean;
// };

// const LocationSelector = ({ value, onChange, disabled }: Props) => {
//     const inputRef = useRef<HTMLInputElement>(null);
//     const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
//     const [isLocationFetching, setIsLocationFetching] = useState(false);

//     useEffect(() => {
//         if (!window.google || !inputRef.current) return;

//         autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current!, {
//             types: ["(cities)"],
//             componentRestrictions: { country: "ee" }, // Estonia
//         });

//         autocompleteRef.current.addListener("place_changed", () => {
//             const place = autocompleteRef.current!.getPlace();
//             const address = place.formatted_address || place.name || "";

//             if (place.geometry && place.geometry.location) {
//                 const lat = place.geometry.location.lat();
//                 const lng = place.geometry.location.lng();
//                 const placeId = place.place_id;

//                 onChange(address, placeId, { lat, lng });
//             } else {
//                 onChange(address);
//             }
//         });
//     }, []);

//     // Function to handle geolocation and reverse geocoding
//     const getLocation = () => {
//         if (navigator.geolocation) {
//             setIsLocationFetching(true);

//             navigator.geolocation.getCurrentPosition(
//                 async (position) => {
//                     const { latitude, longitude } = position.coords;

//                     // Use Google Geocoding API to get the address based on coordinates
//                     const geocoder = new google.maps.Geocoder();
//                     const latLng = new google.maps.LatLng(latitude, longitude);

//                     try {
//                         const results = await new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
//                             geocoder.geocode({ location: latLng }, (results, status) => {
//                                 if (status === google.maps.GeocoderStatus.OK && results) {
//                                     resolve(results);
//                                 } else {
//                                     reject('Geocoder failed or no results found');
//                                 }
//                             });
//                         });

//                         const address = results[0].formatted_address || '';
//                         const placeId = results[0].place_id;
//                         const coordinates = { lat: latitude, lng: longitude };

//                         // Update the state with the geolocation results
//                         onChange(address, placeId, coordinates);

//                         // After getting the location, trigger autocomplete for address completion
//                         if (autocompleteRef.current) {
//                             inputRef.current!.value = address;
//                             autocompleteRef.current.setBounds(new google.maps.LatLngBounds(latLng)); // Adjust bounds for autocomplete
//                         }
//                     } catch (error) {
//                         console.error(error);
//                     } finally {
//                         setIsLocationFetching(false);
//                     }
//                 },
//                 (error) => {
//                     console.error(error);
//                     setIsLocationFetching(false);
//                 }
//             );
//         } else {
//             alert("Geolocation is not supported by this browser.");
//         }
//     };

//     return (
//         <Form.Group className="mb-3">
//             <Form.Label>
//                 Location <span style={{ color: "red" }}>*</span>
//             </Form.Label>
//             <Form.Control
//                 type="text"
//                 ref={inputRef}
//                 defaultValue={value}
//                 placeholder="Start typing your city or address"
//                 disabled={disabled}
//                 required
//             />
//             <Button
//                 variant="secondary"
//                 onClick={getLocation}
//                 disabled={isLocationFetching || disabled}
//                 className="mt-2"
//             >
//                 {isLocationFetching ? "Locating..." : "Use My Location"}
//             </Button>
//         </Form.Group>
//     );
// };

// export default LocationSelector;
