import React, { useState, useEffect } from "react";
import { Container, Button, Spinner, Alert } from "react-bootstrap";
import { FaEdit } from "react-icons/fa";
import { ArrowLeft } from "react-bootstrap-icons";
import { useNavigate } from "react-router-dom";

import { User } from "../types/User";
import apiClient from "../utils/apiClient";
import ProfilePicture from "../components/formComponents/ProfilePicture";
import AccountForm from "../components/forms/AccountForm";
import axios from "axios";

const MyProfilePage = () => {
  const navigate = useNavigate();

  // State for user data, loading status, editing mode, errors, and selected image file
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);

  /**
   * Helper function to ensure a Base64 string has the 'data:image/jpeg;base64,' prefix.
   * This is crucial for displaying Base64 images directly in <img> tags.
   * Assumes JPEG if no prefix is present; might need dynamic MIME type handling for other formats.
   * @param base64String The Base64 string to check/prefix.
   * @returns The Base64 string with the data URL prefix, or an empty string if input is null/undefined.
   */
  const ensureDataUrlPrefix = (base64String: string | undefined | null): string => {
    if (!base64String) {
      return '';
    }
    if (base64String.startsWith("data:image")) {
      return base64String;
    }
    return `data:image/jpeg;base64,${base64String}`;
  };

  /**
   * Helper function to remove the 'data:image/jpeg;base64,' prefix from a data URL.
   * This is necessary when sending Base64 image data to a backend that expects raw Base64.
   * @param dataUrl The full data URL string.
   * @returns The raw Base64 part of the string, or an empty string if input is null/undefined.
   */
  const removeDataUrlPrefix = (dataUrl: string | undefined | null): string => {
    if (!dataUrl) {
      return '';
    }
    const parts = dataUrl.split(',');
    return parts.length > 1 ? parts[1] : dataUrl;
  };

  // Effect hook to load user data on component mount
  useEffect(() => {
    const loadUser = async () => {
      setError(null);
      const storedUser = localStorage.getItem("user");

      if (storedUser) {
        const parsedUser = JSON.parse(storedUser) as User;

        // Ensure profilePicture is correctly formatted for display
        parsedUser.profile.profilePicture = ensureDataUrlPrefix(parsedUser.profile.profilePicture);
        // Ensure name is a string to prevent potential errors
        if (!parsedUser.profile.name) {
            parsedUser.profile.name = '';
        }

        setUser(parsedUser);
        setLoading(false);
      } else if (localStorage.getItem("token")) {
        // If no user in localStorage but a token exists, fetch user from server
        try {
          const res = await apiClient.get<User>("/users");
          const fetchedUser = res.data;

          // Ensure profilePicture is correctly formatted for display
          fetchedUser.profile.profilePicture = ensureDataUrlPrefix(fetchedUser.profile.profilePicture);
          // Ensure name is a string to prevent potential errors
          if (!fetchedUser.profile.name) {
              fetchedUser.profile.name = '';
          }

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
          setLoading(false);
        }
      } else {
        // No user or token, redirect to login
        setLoading(false);
        navigate("/login");
      }
    };

    loadUser();
  }, [navigate]); // Dependency array to re-run effect if navigate changes (unlikely for this use case)

  /**
   * Handler for changes within the user.profile object (e.g., name, bio).
   * Updates the local 'user' state.
   * @param field The specific field within the 'profile' object to update.
   * @param value The new value for the field.
   */
  const handleProfileChange = (field: keyof User["profile"], value: any) => {
    if (!user) return;
    setUser({
      ...user,
      profile: {
        ...user.profile,
        [field]: value,
      },
    });
  };

  /**
   * Handler for changes directly on the user object (root level properties, e.g., username).
   * Updates the local 'user' state.
   * @param field The specific field on the root 'user' object to update.
   * @param value The new value for the field.
   */
  const handleRootChange = (field: keyof User, value: any) => {
    if (!user) return;
    setUser({
      ...user,
      [field]: value,
    });
  };

  /**
   * Reads a selected image file and converts it into a raw Base64 string (without the data URL prefix).
   * @param file The File object selected by the user.
   * @returns A Promise that resolves with the raw Base64 string.
   */
  const readImageAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string; // This is the full data URL (e.g., data:image/jpeg;base64,...)
        const base64 = result.split(",")[1]; // Extracts only the raw Base64 data
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  /**
   * Handles saving the user's profile changes to the backend.
   * Manages image conversion, API patch request, and local state updates.
   */
  const handleSave = async () => {
    if (!user?.id) return; // Prevent saving if user is not loaded
    setError(null);

    // Prepare the payload for the backend: initially a copy of current user state.
    // Ensure profilePicture is in raw Base64 format for the API call.
    const userPayloadForBackend = {
      ...user,
      profile: {
        ...user.profile,
        profilePicture: removeDataUrlPrefix(user.profile.profilePicture),
      },
    };

    // If a new image file was selected, process it for upload
    if (selectedImageFile) {
      try {
        const rawBase64Image = await readImageAsBase64(selectedImageFile); // Get raw Base64
        userPayloadForBackend.profile.profilePicture = rawBase64Image; // Update payload for backend
      } catch (error) {
        console.error("Failed to convert image to Base64", error);
        setError("Failed to process image for upload.");
        return; // Stop the save process if image conversion fails
      }
    } else if (userPayloadForBackend.profile.profilePicture === '') {
        // If the user explicitly cleared the image or it was already empty and no new image was selected.
        // Backend should interpret an empty string as removal or no change for the picture.
    }

    try {
      // Send the modified user object to the server using a PATCH request
      await apiClient.patch(`/users`, userPayloadForBackend);

      // Update local storage with the user data sent to the backend.
      // Storing the raw Base64 here is consistent with what the backend expects,
      // and the useEffect will correctly prefix it for display on next load.
      localStorage.setItem("user", JSON.stringify(userPayloadForBackend));

      // After successful save, update the component's local 'user' state for immediate UI refresh.
      // This ensures the displayed profile picture is updated without a full page reload.
      setUser(prevUser => {
        if (!prevUser) return null;

        let updatedProfilePictureForDisplay = prevUser.profile.profilePicture;

        if (selectedImageFile) {
          // If a new image was selected, create a temporary object URL for instant display.
          // This allows immediate preview without waiting for the backend to send back the Base64.
          updatedProfilePictureForDisplay = URL.createObjectURL(selectedImageFile);
          // TODO: Consider revoking this object URL when it's no longer needed to free up memory.
          // This is typically done in a cleanup effect or when the image changes again.
        } else {
          // If no new file was selected, use the picture data from the backend payload,
          // ensuring it has the data URL prefix for display in the <img> tag.
          updatedProfilePictureForDisplay = ensureDataUrlPrefix(userPayloadForBackend.profile.profilePicture);
        }

        return {
          ...prevUser, // Retain other previous user data
          profile: {
            ...prevUser.profile,
            profilePicture: updatedProfilePictureForDisplay, // Update with the display-ready picture
          },
        };
      });

      // Reset the selected image file and exit editing mode
      setSelectedImageFile(null);
      setEditing(false);

    } catch (err: any) {
      console.error("Failed to save profile", err);
      // Handle and set specific error messages based on the error type
      if (axios.isAxiosError(err)) {
        setError(err.message || "Failed to save profile data.");
      } else if (err instanceof Error) {
        setError(err.message || "An unexpected error occurred while saving profile.");
      } else {
        setError("An unknown error occurred while saving profile.");
      }
    }
  };

  // Display a loading spinner while user data is being fetched
  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" />
      </Container>
    );
  }

  // Display an error message if fetching failed
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

  // Display a message if user or user profile is not found after loading
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

  // Render the profile page content
  return (
    <>
      <div className="d-flex justify-content-between mb-3 px-3 pt-3">
        {/* Button to navigate back to the matching page */}
        <Button
          onClick={() => navigate("/matching")}
          className="d-flex align-items-center px-3 py-2 gap-1"
          variant="primary"
          style={{ height: "40px" }}
        >
          <ArrowLeft size={16} />
          Back
        </Button>

        {/* Button to toggle editing mode */}
        <Button
          variant={editing ? "outline-danger" : "outline-primary"}
          onClick={() => setEditing(!editing)}
          className="d-flex align-items-center px-3 py-2 gap-1"
          style={{ height: "40px" }}
        >
          <FaEdit size={16} />
          {editing ? "Cancel" : "Edit"}
        </Button>
      </div>

      <Container className="mt-5" style={{ maxWidth: "600px" }}>
        <h2 className="mb-3">My Profile</h2>

        {/* Component to display the current profile picture.
            It expects a full data URL or an empty string. */}
        <ProfilePicture profilePicture={user.profile.profilePicture} />

        {/* Form component for account details and profile editing */}
        <AccountForm
          profile={user}
          editing={editing}
          onProfileChange={handleProfileChange}
          onRootChange={handleRootChange}
          onSave={handleSave}
          onImageChange={setSelectedImageFile} // Passes setter for the selected image file
          currentImageFile={selectedImageFile} // Passes the current selected file for display in the form
        />
      </Container>
    </>
  );
};

export default MyProfilePage;