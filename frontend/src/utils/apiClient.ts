import axios from 'axios';

// Create an Axios instance with a base URL
const apiClient = axios.create({
  baseURL: 'http://localhost:8080',
});

// Request interceptor to add authorization token to headers
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // Retrieve token from local storage

    // If a token exists, add it to the Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config; // Return the modified configuration
  },
  (error) => Promise.reject(error) // Reject the promise if there's an error during request setup
);

// Response interceptor to handle global error responses
apiClient.interceptors.response.use(
  (response) => response, // If the response is successful, simply return it
  (error) => {
    // Check if the error is an Axios error and has a response from the server
    if (axios.isAxiosError(error) && error.response) {
      // Handle 403 Forbidden errors specifically
      if (error.response.status === 403) {
        console.warn('403 Forbidden - Redirecting to login');
        localStorage.removeItem('token'); // Clear the invalid token
        window.location.href = '/login'; // Redirect the user to the login page
        // Reject the promise to stop further processing of this error in the component
        return Promise.reject(error);
      }

      // Centralized error message extraction from server response data
      // Prioritize 'debugMessage' if available, as it's often more specific
      if (error.response.data?.debugMessage) {
        // Create a new Error object with the specific debug message
        const customError = new Error(error.response.data.debugMessage);
        // Optionally, copy original error properties for better debugging
        customError.name = error.name; // e.g., 'AxiosError'
        (customError as any).response = error.response; // Preserve the original Axios response
        return Promise.reject(customError); // Reject with the custom error message
      }
      // If 'debugMessage' is not present, but 'message' is, use that
      else if (error.response.data?.message) {
        const customError = new Error(error.response.data.message);
        customError.name = error.name;
        (customError as any).response = error.response;
        return Promise.reject(customError); // Reject with the custom error message
      }
    }

    // For all other errors (e.g., network errors, or server errors without specific messages)
    // or if the error was already handled (like 403), reject the original error
    return Promise.reject(error);
  }
);

export default apiClient;
