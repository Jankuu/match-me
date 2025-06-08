// src/hooks/useAuthData.ts
import { useState, useEffect, useCallback } from 'react';

/**
 * useAuthData Custom Hook
 * Manages fetching and refreshing JWT token and current user ID from localStorage.
 */
const useAuthData = () => {
    const [jwtToken, setJwtToken] = useState<string | null>(null);
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);

    /**
     * Refreshes the JWT token and user ID from localStorage.
     * This is useful when auth state might change (e.g., login/logout).
     * Memoized with useCallback for stable reference.
     */
    const refreshAuthData = useCallback(() => {
        const token = localStorage.getItem("token");
        setJwtToken(token);

        try {
            const userJson = localStorage.getItem("user");
            if (userJson) {
                const user = JSON.parse(userJson);
                // Handle both number and string IDs, preferring number
                if (typeof user.id === 'number') {
                    setCurrentUserId(user.id);
                } else if (typeof user.id === 'string' && !isNaN(parseInt(user.id, 10))) {
                    setCurrentUserId(parseInt(user.id, 10));
                } else {
                    console.warn("User ID in localStorage is not a valid number or string:", user.id);
                    setCurrentUserId(null);
                }
            } else {
                // User object not found, typically means not logged in
                setCurrentUserId(null);
            }
        } catch (e) {
            console.error("Error parsing user data from localStorage:", e);
            setCurrentUserId(null);
        }
        console.log("Auth data refreshed. JWT:", token ? "present" : "null", "User ID:", currentUserId);
    }, [currentUserId]); // currentUserId is a dependency because its value is logged, though technically it's updated within the callback.

    // Initial load of auth data when the hook mounts
    useEffect(() => {
        refreshAuthData();
    }, [refreshAuthData]);

    return { jwtToken, currentUserId, refreshAuthData };
};

export default useAuthData;