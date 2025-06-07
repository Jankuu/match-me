import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { WebSocketProvider } from "./context/WebSocketContext.tsx"; // Import the WebSocket context provider
// import 'bootstrap/dist/css/bootstrap.min.css'; // Commented out: Bootstrap default CSS (likely replaced by custom.scss)
import "./utils/apiClient"; // Imports and executes apiClient setup (e.g., setting up Axios defaults)
import "./index.css"; // Global custom CSS styles
import './styles/custom.scss'; // Custom SASS/SCSS styles (likely compiled to CSS)


// Polyfills for Node.js global variables in a browser environment.
// These are often needed by libraries that were originally designed for Node.js
// but are now being used in a browser (e.g., some cryptographic libraries or network clients).
// STOMP.js (used by @stomp/stompjs) often relies on these.
(window as any).global = window;
(window as any).process = {
    env: { NODE_ENV: import.meta.env.MODE }, // Provides process.env.NODE_ENV, useful for dev/prod checks
};

// Entry point for the React application.
// It finds the HTML element with the ID 'root' and renders the React component tree into it.
createRoot(document.getElementById("root")!).render(
    // StrictMode is a tool for highlighting potential problems in an application.
    // It does not render any visible UI. It activates additional checks and warnings
    // for its descendants. These checks run in development mode only.
    <StrictMode>
        {/*
            WebSocketProvider makes the WebSocket context available to all components
            within its subtree. This means any component nested inside <App />
            can use the `useWebSocket` hook to access WebSocket client, messages,
            and notification states.
        */}
        <WebSocketProvider>
            {/* The main application component, where your primary UI and routing typically reside. */}
            <App />
        </WebSocketProvider>
    </StrictMode>
);