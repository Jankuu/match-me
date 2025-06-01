import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { Buffer } from "buffer";
import { WebSocketProvider } from "./context/WebSocketContext.tsx";
// import 'bootstrap/dist/css/bootstrap.min.css';
import "./utils/apiClient";
import "./index.css";
import './styles/custom.scss';




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
