import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
            </Routes>
        </Router>
    );
}

export default App;
// function App() {
//     const { client, isConnected } = useWebSocket();
//     const [isLoggedIn, setIsLoggedIn] = useState(false);

//     useEffect(() => {
//         if (!client || !isConnected) return;

//         const subscription = client.subscribe(
//             "/topic/my-custom-topic",
//             (msg) => {
//                 console.log("📥 Received:", msg.body);
//             }
//         );

//         return () => subscription.unsubscribe();
//     }, [client, isConnected]);

//     const [text, setText] = useState("");

//     const handleSend = () => {
//         if (client && isConnected) {
//             client.publish({ destination: "/app/send", body: text });
//             console.log("📤 Sent to server:", text);
//         } else {
//             console.warn("WebSocket not connected");
//         }
//         setText("");
//         if (client && isConnected) {
//             client.publish({
//                 destination: "/app/send",
//                 body: "11",
//             });
//             console.log("📤 Sent to server:", "11");
//         } else {
//             console.warn("WebSocket not connected");
//         }
//         setText("");
//     };

//     if (!isLoggedIn) {
//         return <LoginPage onLogin={() => setIsLoggedIn(true)} />;
//     }

//     return (
//         <div>
//             <input value={text} onChange={(e) => setText(e.target.value)} />
//             <button
//                 onClick={handleSend}
//                 disabled={!isConnected || !text.trim()}
//             >
//                 Send
//             </button>
//         </div>
//     );
// }



