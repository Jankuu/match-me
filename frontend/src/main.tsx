import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { Buffer } from "buffer";
import { WebSocketProvider } from "./WebSocketContext.tsx";
import 'bootstrap/dist/css/bootstrap.min.css';


(window as any).global = window;
(window as any).process = {
    env: { NODE_ENV: import.meta.env.MODE },
};
(window as any).Buffer = Buffer;

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <WebSocketProvider>
            <App />
        </WebSocketProvider>
    </StrictMode>
);
