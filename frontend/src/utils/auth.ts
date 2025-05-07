/**
 * Utility functions for authentication and JWT token handling
 */

/**
 * Extracts the username/identifier from the JWT token stored in localStorage
 * @returns The username/identifier from the token, or null if no token is found or it's invalid
 */
export function getUserIdentifierFromToken(): string | null {
  const token = localStorage.getItem("token");
  if (!token) return null;
  
  try {
    // JWT tokens are in format: header.payload.signature
    const payload = token.split('.')[1];
    // Base64 decode and parse as JSON
    const decoded = JSON.parse(atob(payload));
    // The subject claim contains the username/identifier
    return decoded.sub;
  } catch (error) {
    console.error("Error decoding token", error);
    return null;
  }
}

/**
 * Checks if the user is authenticated (has a valid token)
 * @returns True if the user is authenticated, false otherwise
 */
export function isAuthenticated(): boolean {
  const token = localStorage.getItem("token");
  if (!token) return false;
  
  try {
    // JWT tokens are in format: header.payload.signature
    const payload = token.split('.')[1];
    // Base64 decode and parse as JSON
    const decoded = JSON.parse(atob(payload));
    // Check if token is expired
    const expirationTime = decoded.exp * 1000; // Convert to milliseconds
    return Date.now() < expirationTime;
  } catch (error) {
    console.error("Error checking authentication", error);
    return false;
  }
}