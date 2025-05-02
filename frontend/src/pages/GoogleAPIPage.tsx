import { useState, useEffect, useRef } from "react";

const GOOGLE_API_KEY = "AIzaSyAxTGRnzTGPCUcYHJ-BPRGGexJzFo1aVbc";

const GoogleAPIPage = () => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState<any[]>([]); // output is a list of suggestions

  const autocompleteServiceRef =
    useRef<google.maps.places.AutocompleteService | null>(null);

  const placesServiceRef = useRef<google.maps.places.PlacesService | null>(
    null
  );

  const [coordinates, setCoordinates] = useState<{
    lat: number;
    lng: number;
  } | null>(null); // Coordinates of selected place

  // Initialize AutocompleteService when component mounts
  useEffect(() => {
    if (window.google && !autocompleteServiceRef.current) {
      autocompleteServiceRef.current =
        new window.google.maps.places.AutocompleteService();
    }
  }, []);

  const handleSend = async () => {
    if (!autocompleteServiceRef.current) {
      console.error("Google AutocompleteService not initialized");
      return;
    }

    autocompleteServiceRef.current.getPlacePredictions(
      {
        input,
        types: ["(cities)"],
      },
      (predictions, status) => {
        if (
          status !== window.google.maps.places.PlacesServiceStatus.OK ||
          !predictions
        ) {
          console.error("Error fetching place predictions:", status);
          return;
        }

        setOutput(predictions);
        console.log(predictions);
      }
    );
  };

  // Function to call Google Places Details API
  const handleSelect = async (
    place: google.maps.places.AutocompletePrediction
  ) => {
    try {
      const { PlacesService } = (await google.maps.importLibrary(
        "places"
      )) as google.maps.PlacesLibrary;

      if (!placesServiceRef.current) {
        //placesServiceRef.current = new PlacesService();
      }

      // Instantiates the Places client
      /*
      const placesClient = new PlacesClient({
        apiKey: "AIzaSyAxTGRnzTGPCUcYHJ-BPRGGexJzFo1aVbc",
      });*/
      // Construct the resource name from the Place ID.
      const placeName = `places/${place.place_id}`;
      // Construct the request object.
      const request = {
        name: placeName,
      };
      // Construct the call options, including the Field Mask header.
      /*
        const callOptions = {
            otherArgs: {
                headers: {
                    'X-Goog-FieldMask': fieldMask,
                },
            },
        };*/
      // Call Place Details and output the response to the console
      // const response = await placesClient.getPlace(request);
      // console.log(response);
    } catch {
      console.log("Error");
    }
  };

  return (
    <div>
      <p>GOOGLE API PAGE</p>
      <input
        type="text"
        onChange={(e) => setInput(e.target.value)}
        value={input}
      />
      <button onClick={handleSend}>SEND</button>

      <div>
        {output.map((place, idx) => (
          <div key={idx}>
            <button onClick={() => handleSelect(place)}>
              {place.description}
            </button>
            <br />
          </div>
        ))}
      </div>
    </div>
  );
};

export default GoogleAPIPage;
