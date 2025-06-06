// src/pages/UserProfilePage.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Container, Card } from 'react-bootstrap';
import { ArrowLeft } from 'react-bootstrap-icons';
import apiClient from '../utils/apiClient';
import { UserProfile } from '../types/UserProfile'; // Ensure this path to your UserProfile type is correct

// UserProfile Type (updated to be optional/nullable)
// It's crucial that this type is consistently defined in your src/types/UserProfile.ts
// and used throughout your project to avoid runtime errors due to type mismatches.
// If UserProfile is already exported from 'src/types/UserProfile.ts', you don't need to repeat it here.
// If it was only defined within a component, consider moving it to a shared types file.
/*
export type UserProfile = {
  id: number;
  name?: string | null;
  profilePicture?: string | null;
  birthDate?: string | null;
  gender?: string | null;
  height?: number | null;
  description?: string | null;
};
*/

/**
 * Calculates the age of a user based on their birth date.
 * Returns null if the birth date is not provided or invalid.
 * @param birthDate - The birth date string of the user (e.g., "YYYY-MM-DD").
 * @returns The calculated age or null.
 */
const calculateAge = (birthDate?: string | null): number | null => {
  if (!birthDate) return null;
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

/**
 * UserProfilePage component displays a detailed view of a user's profile.
 * It handles fetching user data either from route state (if navigated from a list)
 * or by making an API call using the user ID from the URL parameters (for direct access/refresh).
 */
const UserProfilePage: React.FC = () => {
  // Extract user ID from URL parameters
  const { id } = useParams<{ id: string }>();
  // Access location state to get profile data if passed during navigation
  const location = useLocation();
  // Hook for programmatic navigation
  const navigate = useNavigate();

  // Attempt to get profile data from the navigation state
  const profileFromState = location.state?.profile as UserProfile | undefined;

  // State to store the current user's profile data
  const [currentProfile, setCurrentProfile] = useState<UserProfile | null>(null);
  // State to manage loading status
  const [isLoading, setIsLoading] = useState(true);
  // State to store any error messages
  const [error, setError] = useState<string | null>(null);

  /**
   * useEffect hook to load user profile data.
   * It prioritizes data from navigation state, then fetches from API if not available.
   * Handles loading, error states, and redirects if ID is missing.
   */
  useEffect(() => {
    const loadProfile = async () => {
      if (profileFromState) {
        // If profile data is available in the navigation state (e.g., from MatchingPage click)
        setCurrentProfile(profileFromState);
        setIsLoading(false);
      } else if (id) {
        // If profile data is not in state (e.g., page refresh or direct URL access), fetch from API
        try {
          setIsLoading(true);
          // Assuming an API endpoint to get user profile by ID
          const res = await apiClient.get(`/users/${id}`);
          setCurrentProfile(res.data);
          setError(null);
        } catch (err) {
          console.error("Failed to fetch user profile:", err);
          setError("Failed to load user profile. It might not exist or there was a network error.");
          // Optional: redirect to a 404 page or a listing page if profile is not found
          // navigate('/not-found');
        } finally {
          setIsLoading(false);
        }
      } else {
        // If no user ID is provided in the URL
        setIsLoading(false);
        setError("User ID is missing in the URL.");
        navigate('/matching'); // Redirect to the matching page
      }
    };

    loadProfile();
  }, [id, profileFromState, navigate]); // Depend on id, profileFromState, and navigate

  // --- Render Logic ---

  // Display loading indicator while data is being fetched
  if (isLoading) {
    return <div className="text-center mt-5">Loading profile...</div>;
  }

  // Display error message if an error occurred during data fetching
  if (error) {
    return <div className="alert alert-danger text-center mt-5">{error}</div>;
  }

  // Display "Profile not found" if no profile data was loaded and no error occurred
  if (!currentProfile) {
    return <div className="text-center mt-5">User profile not found.</div>;
  }

  // If profile data is loaded, calculate age and render profile details
  const age = calculateAge(currentProfile.birthDate);

  return (
    <>
      {/* Back button section */}
      <div className="px-3 pt-3">
        {/* Changed button variant to btn-primary for visual consistency or branding */}
        <button onClick={() => navigate("/matching")} className="btn btn-primary">
          <ArrowLeft size={20} className="me-1" />
          Back
        </button>
      </div>

      {/* Main profile card container */}
      <Container className="mt-4" style={{ maxWidth: "600px" }}>
        <Card className="p-4 shadow">
          {/* Profile picture / Placeholder section, centered using flexbox */}
          <div className="text-center mb-3 d-flex justify-content-center">
            {currentProfile.profilePicture ? (
              // Display profile picture if available
              <img
                src={
                  currentProfile.profilePicture.startsWith("data:image")
                    ? currentProfile.profilePicture
                    : `data:image/jpeg;base64,${currentProfile.profilePicture}`
                }
                alt="Profile"
                className="rounded-circle"
                style={{ width: "150px", height: "150px", objectFit: "cover" }}
              />
            ) : (
              // Display initial placeholder if no profile picture
              <div
                className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center"
                style={{ width: "150px", height: "150px", fontSize: "24px" }}
              >
                {/* Display the first letter of the name, or 'U' if name is missing */}
                {(currentProfile.name || 'U').charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* User's name with fallback */}
          <h3 className="text-center">{currentProfile.name || 'Unknown User'}</h3>
          {/* Age display, only if calculated age is not null */}
          {age !== null && <p className="text-center text-muted"><strong>Age:</strong> {age}</p>}
          {/* Gender display, only if gender is provided */}
          {currentProfile.gender && <p className="text-center"><strong>Gender:</strong> {currentProfile.gender}</p>}
          {/* Height display, only if height is provided */}
          {currentProfile.height && <p className="text-center"><strong>Height:</strong> {currentProfile.height} cm</p>}
          {/* Description section, only if description is provided */}
          {currentProfile.description && (
            <>
              <h5 className="mt-4">About</h5>
              <p>{currentProfile.description}</p>
            </>
          )}
        </Card>
      </Container>
    </>
  );
};

export default UserProfilePage;