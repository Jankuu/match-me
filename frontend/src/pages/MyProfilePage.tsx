import React, { useState, useEffect, useCallback } from "react";
import { Container, Button, Spinner, Alert } from "react-bootstrap";
import { FaEdit } from "react-icons/fa";
import { ArrowLeft } from "react-bootstrap-icons";
import { useNavigate } from "react-router-dom";

import { User } from "../types/User";
import { Game } from "../dto/Game";
import apiClient from "../utils/apiClient";
import ProfilePicture from "../components/formComponents/ProfilePicture";
import AccountForm from "../components/forms/AccountForm";
import axios from "axios"; // Import axios for error checking

const MyProfilePage = () => {
  const navigate = useNavigate();

  // State for the currently displayed user profile (from localStorage or API)
  const [user, setUser] = useState<User | null>(null);
  // State for the draft user profile during editing
  const [draftUser, setDraftUser] = useState<User | null>(null);

  // Loading, editing, and error states
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // State for the new profile picture file selected by the user
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);

  // State to track birth date validation status
  const [isBirthDateValid, setIsBirthDateValid] = useState(true);

  // Memoized helper function to ensure data URL prefix for base64 images
  const ensureDataUrlPrefix = useCallback((base64String: string | undefined | null): string => {
    if (!base64String) {
      return '';
    }
    if (base64String.startsWith("data:image")) {
      return base64String;
    }
    return `data:image/jpeg;base64,${base64String}`;
  }, []); // No dependencies, as it's a pure function

  // Memoized helper function to remove data URL prefix from base64 images
  const removeDataUrlPrefix = useCallback((dataUrl: string | undefined | null): string => {
    if (!dataUrl) {
      return '';
    }
    const parts = dataUrl.split(',');
    return parts.length > 1 ? parts[1] : dataUrl;
  }, []); // No dependencies

  // Memoized helper function to read an image file as a base64 string
  const readImageAsBase64 = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }, []); // No dependencies

  // Effect to load user profile data on component mount or when navigation changes
  useEffect(() => {
    const loadUser = async () => {
      setError(null);
      setLoading(true); // Set loading to true at the start of data fetching

      const storedUser = localStorage.getItem("user");

      if (storedUser) {
          const parsedData = JSON.parse(storedUser);
          const cityName = parsedData.cityName
        const parsedUser = JSON.parse(storedUser) as User;
          parsedUser.profile.location = cityName;
        // Ensure profile picture has data URL prefix for display
        parsedUser.profile.profilePicture = ensureDataUrlPrefix(parsedUser.profile.profilePicture);
        parsedUser.profile.name = parsedUser.profile.name || ''; // Ensure name is not null/undefined

          setUser(parsedUser);
          setDraftUser(parsedUser); // <-- ✅ Initialize draftUser here
          setLoading(false);
      } else if (localStorage.getItem("token")) {
          try {
              const res = await apiClient.get<User>("/users");
              const fetchedUser = res.data;
              // Ensure profile picture has data URL prefix for display
              fetchedUser.profile.profilePicture = ensureDataUrlPrefix(fetchedUser.profile.profilePicture);
              fetchedUser.profile.name = fetchedUser.profile.name || '';

          setUser(fetchedUser);
          localStorage.setItem("user", JSON.stringify(fetchedUser)); // Store fetched user in localStorage
        } catch (err: any) {
          console.error("Failed to load user from server", err);
          if (axios.isAxiosError(err)) {
              setError(err.message || "Failed to load user profile from server.");
          } else if (err instanceof Error) {
              setError(err.message || "An unexpected error occurred while loading profile.");
          } else {
              setError("An unknown error occurred while loading profile.");
          }
        } finally {
          setLoading(false); // Set loading to false after fetch attempt
        }
      } else {
        setLoading(false);
        navigate("/login"); // Redirect to login if no user or token is found
      }
    };
    loadUser();
  }, [navigate, ensureDataUrlPrefix]); // Dependencies: navigate and ensureDataUrlPrefix

  // Memoized callback for changing profile (nested) fields in the draft user
  const handleProfileChange = useCallback((field: keyof User["profile"], value: any) => {
    setDraftUser(prevDraft => {
      if (!prevDraft) return null;
      return {
        ...prevDraft,
        profile: {
          ...prevDraft.profile,
          [field]: value,
        },
      };
    });
  }, []); // No dependencies, as setState functional update is used

  // Memoized callback for changing root-level user fields in the draft user
  const handleRootChange = useCallback((field: keyof User, value: any) => {
    setDraftUser(prevDraft => {
      if (!prevDraft) return null;

      // Special handling for 'interestedGames' to prevent unnecessary re-renders
      if (field === "interestedGames" && Array.isArray(value)) {
        const currentGames = prevDraft.interestedGames || [];
        const newGames = value as Game[];

        // Check if lengths are different, if so, arrays are not equal
        if (currentGames.length !== newGames.length) {
            // Lengths are different, so arrays are definitely not equal
        } else {
            // Convert both arrays to Sets of IDs for efficient comparison
            const currentGameIds = new Set(currentGames.map(g => g.id));
            const newGameIds = new Set(newGames.map(g => g.id));

            let allEqual = true;
            // Check if set sizes are different
            if (currentGameIds.size !== newGameIds.size) {
                allEqual = false;
            } else {
                // Check if all new IDs are present in the current IDs set
                for (const id of newGameIds) {
                    if (!currentGameIds.has(id)) {
                        allEqual = false;
                        break;
                    }
                }
            }

            if (allEqual) {
                // If content by ID is identical, return the previous draft object
                // to avoid state update and unnecessary re-render.
                return prevDraft;
            }
        }
      }

      // For other fields, or if interestedGames truly changed, create a new object with the updated field.
      return {
        ...prevDraft,
        [field]: value,
      };
    });
  }, []); // No dependencies, as setState functional update is used

  // Memoized callback to clear the profile picture
  const handleClearProfilePicture = useCallback(() => {
    setDraftUser(prevDraft => {
      if (!prevDraft) return null;
      return {
        ...prevDraft,
        profile: {
          ...prevDraft.profile,
          profilePicture: '', // Set to empty string for the draft
        },
      };
    });
    setSelectedImageFile(null); // Clear any newly selected file
  }, []); // No dependencies

    const handleLocationDataChange = useCallback((locationData: any) => {
        const updater = (prev: User | null) => {
            if (!prev) return prev;

            const updated = { ...prev };

            if (locationData) {
                updated.locationData = locationData;
                updated.profile = {
                    ...updated.profile,
                    location: locationData.cityName || updated.profile.location
                };
            } else {
                delete updated.locationData;
                updated.profile = {
                    ...updated.profile,
                    location: ""
                };
            }

            return updated;
        };

        setUser(updater);
        setDraftUser(updater);
    }, []);

  // Memoized callback to save profile changes to the backend
  const handleSave = useCallback(async () => {
    // Validate draftUser and birth date
    if (!draftUser?.id || !isBirthDateValid) {
        setError("Please ensure all required fields are valid before saving.");
        return;
    }
    setError(null); // Clear previous errors

    // Prepare the payload for the backend from `draftUser`.
    // Profile picture is sent as raw Base64 (without data URL prefix).
      const currentLocationData = user?.locationData || draftUser.locationData;

      const userPayloadForBackend = {
          ...draftUser,
          profile: {
              ...draftUser.profile,
              profilePicture: removeDataUrlPrefix(draftUser.profile.profilePicture)
          },
          isGpsUser: currentLocationData?.isGpsUsed,
          googlePlaceId: currentLocationData?.placeId,
          lat: currentLocationData?.coordinates?.lat,
          lng: currentLocationData?.coordinates?.lng,
          cityName: draftUser.profile.location,
      };


      // If a new image file was selected, it overrides the current picture in the payload.
    if (selectedImageFile) {
        try {
            const rawBase64Image = await readImageAsBase64(selectedImageFile);
            userPayloadForBackend.profile.profilePicture = rawBase64Image;
        } catch (error) {
            console.error("Failed to convert image to Base64", error);
            setError("Failed to process image for upload.");
            return;
        }
    }

    try {
      // Send the modified user data to the server
      await apiClient.patch(`/users`, userPayloadForBackend);

      // After successful save, update the main 'user' state.
      // Important: for display in the UI, re-add the Base64 prefix.
      const updatedUserForDisplay = {
        ...userPayloadForBackend,
        profile: {
          ...userPayloadForBackend.profile,
          profilePicture: ensureDataUrlPrefix(userPayloadForBackend.profile.profilePicture)
        }
      };
      setUser(updatedUserForDisplay); // Update the main user state

      // Update localStorage with the data sent to the backend (without prefix)
      localStorage.setItem("user", JSON.stringify(userPayloadForBackend));

      // Exit editing mode and reset temporary states
      setEditing(false);
      setDraftUser(null); // Clear the draft
      setSelectedImageFile(null); // Clear the selected file
    } catch (err: any) {
      console.error("Failed to save profile", err);
      if (axios.isAxiosError(err)) {
        setError(err.message || "Failed to save profile data.");
      } else if (err instanceof Error) {
        setError(err.message || "An unexpected error occurred while saving profile.");
      } else {
        setError("An unknown error occurred.");
      }
    }
  }, [draftUser, isBirthDateValid, selectedImageFile, removeDataUrlPrefix, readImageAsBase64, ensureDataUrlPrefix, user]); // Dependencies

  // Memoized callback to toggle editing mode
  const toggleEditing = useCallback(() => {
    if (editing) { // If currently in editing mode and "Cancel" is clicked
      setEditing(false);
      setDraftUser(null); // Discard all changes in the draft
      setSelectedImageFile(null); // Discard any newly selected file
    } else { // If not in editing mode and "Edit" is clicked
      setEditing(true);
      // Create a deep copy of the current user for editing.
      if (user) {
        setDraftUser(JSON.parse(JSON.stringify(user)));
      }
      setSelectedImageFile(null); // Ensure no stale selected file
    }
  }, [editing, user]); // Dependencies: 'editing' and 'user'

  // Display loading spinner
  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" />
      </Container>
    );
  }

  // Display error message
  if (error) {
      return (
          <Container className="mt-5" style={{ maxWidth: "600px" }}>
              <Alert variant="danger">
                  {error}
                  <br/>
                  Please try again later.
              </Alert>
              <Button
                  variant="primary"
                  onClick={() => navigate("/matching")}
                  className="mt-3"
              >
                  Go Back
              </Button>
          </Container>
      );
  }

  // Display message if profile not found or incomplete
  if (!user || !user.profile) {
    return (
      <Container className="mt-5 text-center">
        <p>Profile not found or incomplete.</p>
        <Button
            variant="primary"
            onClick={() => navigate("/login")}
            className="mt-3"
        >
            Login
        </Button>
      </Container>
    );
  }

  return (
    <>
      <div className="d-flex justify-content-between mb-3 px-3 pt-3">
        <Button
          onClick={() => navigate("/matching")}
          className="d-flex align-items-center px-3 py-2 gap-1"
          variant="primary"
          style={{ height: "40px" }}
        >
          <ArrowLeft size={16} />
          Back
        </Button>

        <Button
          variant={editing ? "outline-danger" : "outline-primary"}
          onClick={toggleEditing}
          className="d-flex align-items-center px-3 py-2 gap-1"
          style={{ height: "40px" }}
        >
          <FaEdit size={16} />
          {editing ? "Cancel" : "Edit"}
        </Button>
      </div>

      <Container className="mt-5" style={{ maxWidth: "600px" }}>
        <h2 className="mb-3">My Profile</h2>

        <ProfilePicture profilePicture={user.profile.profilePicture || ''} />

        {/* Render AccountForm with either draftUser (if editing) or user */}
        {(editing ? draftUser : user) && (
          <AccountForm
            profile={editing ? draftUser! : user!} // Pass the correct profile state
            editing={editing}
            onProfileChange={handleProfileChange}
            onRootChange={handleRootChange}
            onSave={handleSave}
            onImageChange={setSelectedImageFile}
            currentImageFile={selectedImageFile}
            onClearProfilePicture={handleClearProfilePicture}
            onBirthDateValidationChange={setIsBirthDateValid}
            onLocationDataChange={handleLocationDataChange}
          />
        )}
      </Container>
    </>
  );
};

export default MyProfilePage;