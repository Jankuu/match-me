// src/components/ChatPage.tsx
import React, { useEffect, useState, useCallback, useRef } from "react";
import { useWebSocket } from "../context/WebSocketContext";
import { Container, Button } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "react-bootstrap-icons";
import apiClient from "../utils/apiClient";
import { ChatMessage } from "../types/ChatMessage";
import ChatMessageList from "../components/chatComponents/ChatMessageList";
import ChatInput from "../components/chatComponents/ChatInput";
import "../styles/ChatPage.css"

// Number of messages to load per pagination request
const PAGE_SIZE = 20;

const ChatPage: React.FC = () => {
    const { id, name } = useParams<{ id: string; name: string }>();

    const receiverId = Number(id);
    const receiverName = name || "unknown";

    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    const currentUserId = Number(userData?.id || userData?.profile?.id);
    const currentUsername = userData?.username || "You";

    const { sendMessage, isConnected, registerMessageCallback, markMessagesAsReadForUser } = useWebSocket();

    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [text, setText] = useState("");
    const navigate = useNavigate();

    const messagesContainerRef = useRef<HTMLDivElement>(null);

    const [currentPage, setCurrentPage] = useState<number>(0);
    const [totalPages, setTotalPages] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [hasMore, setHasMore] = useState<boolean>(true);

    const isLoadingRef = useRef(isLoading);
    isLoadingRef.current = isLoading;
    const currentPageRef = useRef(currentPage);
    currentPageRef.current = currentPage;
    const totalPagesRef = useRef(totalPages);
    totalPagesRef.current = totalPages;

    // Helper to generate a unique temporary ID (e.g., using timestamp + random)
    const generateTempId = (): string => `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    /**
     * Callback function to handle incoming real-time messages from WebSocket.
     * This is the core logic for handling messages that may or may not have a backend ID.
     * @param message The incoming ChatMessage object.
     */
    const handleIncomingMessage = useCallback((incomingMessage: ChatMessage) => {
        const isMessageRelevant =
            (incomingMessage.senderProfileId === receiverId && incomingMessage.receiverProfileId === currentUserId) ||
            (incomingMessage.senderProfileId === currentUserId && incomingMessage.receiverProfileId === receiverId);

        if (!isMessageRelevant) {
            return; // Ignore messages not for this chat
        }

        setChatMessages((prevMessages) => {
            let updatedMessages = [...prevMessages];
            let messageAddedOrUpdated = false;

            if (incomingMessage.id !== null && incomingMessage.id !== undefined) {
                // Case 1: Message has a real ID from the backend.
                // This means it's either a new message from another user (with ID)
                // or an echo of our own message with its final persisted ID.
                const existingIndex = updatedMessages.findIndex(
                    (msg) => msg.id === incomingMessage.id ||
                             // Also check by tempId if this is an echo of an optimistically sent message
                             (msg.senderProfileId === incomingMessage.senderProfileId &&
                              msg.content === incomingMessage.content &&
                              // Compare timestamps with a tolerance, as server might return slightly different ISO string
                              Math.abs(new Date(msg.timestamp).getTime() - new Date(incomingMessage.timestamp).getTime()) < 1000)
                );

                if (existingIndex > -1) {
                    // Update existing message (e.g., replace tempId with real ID)
                    if (updatedMessages[existingIndex].id === null && incomingMessage.id !== null) {
                        console.log("Updating optimistically added message with real ID:", incomingMessage);
                        updatedMessages[existingIndex] = { ...incomingMessage, tempId: undefined }; // Remove tempId after real ID is received
                        messageAddedOrUpdated = true;
                    } else {
                        console.log("Duplicate (real ID) message received, not updating state:", incomingMessage);
                    }
                } else {
                    // It's a new message with a real ID (e.g., from another user)
                    console.log("Adding new message with real ID:", incomingMessage);
                    updatedMessages.push(incomingMessage);
                    messageAddedOrUpdated = true;
                }
            } else {
                // Case 2: Message has ID as null (temp ID from backend or initial push)
                // This is where we need to be careful with deduplication based on content/timestamp.
                // This might be an optimistic update that hasn't received its real ID yet,
                // or a new message from another user whose ID is simply null from the backend.

                const isAlreadyPresentByContent = updatedMessages.some(
                    (msg) => msg.content === incomingMessage.content &&
                             msg.senderProfileId === incomingMessage.senderProfileId &&
                             msg.receiverProfileId === incomingMessage.receiverProfileId &&
                             // Use timestamp for uniqueness when ID is null
                             Math.abs(new Date(msg.timestamp).getTime() - new Date(incomingMessage.timestamp).getTime()) < 1000
                );

                if (!isAlreadyPresentByContent) {
                    // Generate a new tempId if it's not present and ID is null
                    const messageWithTempId = { ...incomingMessage, tempId: generateTempId() };
                    console.log("Adding new message with tempId (backend ID is null):", messageWithTempId);
                    updatedMessages.push(messageWithTempId);
                    messageAddedOrUpdated = true;
                } else {
                    console.log("Duplicate (null ID) message received based on content/timestamp, not adding:", incomingMessage);
                }
            }

            if (messageAddedOrUpdated) {
                // Sort messages to maintain chronological order
                return updatedMessages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
            }
            return prevMessages; // No change if no message was added or updated
        });
        
        // Mark messages as read only when a new message that was NOT already in chatMessages arrives
        // This is tricky if backend echoes read status, so perhaps always mark read when active chat receives a relevant message.
        markMessagesAsReadForUser(receiverId);
    }, [receiverId, currentUserId, markMessagesAsReadForUser]);


    /**
     * Fetches message history for the current chat session.
     * Handles pagination and adjusts scroll position after loading older messages.
     * @param pageToLoad The page number to load (0-indexed).
     * @param initialScroll True if this is the initial load (scroll to bottom), false otherwise.
     */
    const fetchMessages = useCallback(async (pageToLoad: number, initialScroll: boolean = false) => {
        if (!currentUserId || !receiverId || isLoadingRef.current) {
            console.log("Fetch aborted:", { currentUserId, receiverId, isLoading: isLoadingRef.current });
            return;
        }
        if (pageToLoad < 0 || (totalPagesRef.current > 0 && pageToLoad >= totalPagesRef.current)) {
            setHasMore(false);
            console.log("No more pages to load or invalid page number:", pageToLoad);
            return;
        }

        setIsLoading(true);
        console.log(`Fetching messages: page=${pageToLoad}, size=${PAGE_SIZE}`);

        const previousScrollHeight = messagesContainerRef.current ? messagesContainerRef.current.scrollHeight : 0;

        try {
            const response = await apiClient.get<{ content: ChatMessage[], totalPages: number, number: number }>(`/messages`, {
                params: {
                    otherUserProfileId: receiverId,
                    page: pageToLoad,
                    size: PAGE_SIZE,
                },
            });
            const fetchedMessages = response.data.content;
            const newTotalPages = response.data.totalPages;
            const fetchedPageNumber = response.data.number;

            const sortedFetchedMessages = fetchedMessages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

            setChatMessages((prev) => {
                let combinedMessages: ChatMessage[];
                if (initialScroll) {
                    combinedMessages = sortedFetchedMessages;
                } else {
                    // Prepend new messages to maintain scroll position when loading older
                    combinedMessages = [...sortedFetchedMessages, ...prev];
                }

                const uniqueMessagesMap = new Map<number | string, ChatMessage>(); // Use number | string for keys
                for (const msg of combinedMessages) {
                    // Prioritize real ID, fall back to tempId
                    const key = msg.id !== null && msg.id !== undefined ? msg.id : msg.tempId;
                    if (key !== undefined) {
                        uniqueMessagesMap.set(key, msg);
                    }
                }
                const uniqueMessages = Array.from(uniqueMessagesMap.values());
                
                return uniqueMessages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
            });

            setTotalPages(newTotalPages);
            setCurrentPage(fetchedPageNumber);
            setHasMore(fetchedPageNumber > 0);

            // Scroll adjustment logic moved here, as ChatPage owns messagesContainerRef
            if (initialScroll) {
                setTimeout(() => {
                    if (messagesContainerRef.current) {
                        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
                        console.log("Initial scroll to bottom completed.");
                    }
                }, 100);
            } else if (messagesContainerRef.current) {
                setTimeout(() => {
                    if (messagesContainerRef.current) {
                        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight - previousScrollHeight;
                        console.log("Scroll adjusted after loading older messages.");
                    }
                }, 0);
            }

        } catch (error) {
            console.error("Error fetching message history:", error);
            setHasMore(false);
        } finally {
            setIsLoading(false);
        }
    }, [currentUserId, receiverId]);

    /**
     * Effect for initial message history load when the chat component mounts
     * or when the current user/receiver changes.
     */
    useEffect(() => {
        if (!currentUserId || !receiverId) return;

        // Reset all chat-related states for a fresh chat session
        setChatMessages([]);
        setCurrentPage(0);
        setTotalPages(0);
        setIsLoading(false);
        setHasMore(true);

        const loadInitialMessages = async () => {
            if (isLoadingRef.current) return;

            setIsLoading(true);
            try {
                // First, make a small request to get the total number of pages
                const initialResponse = await apiClient.get<{ totalPages: number }>(`/messages`, {
                    params: {
                        otherUserProfileId: receiverId,
                        page: 0,
                        size: 1, // Only need 1 message to get totalPages metadata
                    },
                });
                const totalAvailablePages = initialResponse.data.totalPages;
                totalPagesRef.current = totalAvailablePages; // Update ref for use in other effects

                if (totalAvailablePages > 0) {
                    // Load the LAST page of messages for initial display
                    await fetchMessages(totalAvailablePages - 1, true); // `true` for initialScroll
                } else {
                    setChatMessages([]); // No messages to display
                }
            } catch (error) {
                console.error("Error during initial history load:", error);
            } finally {
                setIsLoading(false); // Clear loading state
            }
        };

        loadInitialMessages(); // Execute the initial load

        // Register WebSocket callback for real-time messages
        const cleanupCallback = registerMessageCallback(receiverId, handleIncomingMessage);
        // Mark existing messages as read when entering the chat
        markMessagesAsReadForUser(receiverId);

        // Cleanup function for when the component unmounts or dependencies change
        return () => {
            cleanupCallback(); // Unregister the WebSocket callback
            markMessagesAsReadForUser(receiverId); // Mark messages read when leaving chat as well
        };
    }, [receiverId, currentUserId, registerMessageCallback, markMessagesAsReadForUser, handleIncomingMessage, fetchMessages]);

    useEffect(() => {
      if (messagesContainerRef.current) {
          messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
      }
  }, [chatMessages]);
    /**
     * Effect for handling scroll events on the messages container to load older messages.
     */
    useEffect(() => {
        const handleScroll = () => {
            if (messagesContainerRef.current) {
                const { scrollTop } = messagesContainerRef.current;
                // If scrolled near the top (within 5px buffer), not currently loading,
                // and there are more older pages available, fetch the previous page.
                if (scrollTop <= 5 && !isLoadingRef.current && currentPageRef.current > 0 && hasMore) {
                    fetchMessages(currentPageRef.current - 1); // Load the previous page
                }
            }
        };

        const container = messagesContainerRef.current;
        if (container) {
            container.addEventListener('scroll', handleScroll);
        }
        // Cleanup: remove event listener when component unmounts or dependencies change
        return () => {
            if (container) {
                container.removeEventListener('scroll', handleScroll);
            }
        };
    }, [hasMore, fetchMessages]); // Dependencies: hasMore (to know if there's more to load) and fetchMessages (which is stable)

    /**
     * Handles sending a message when the send button is clicked or Enter is pressed.
     * Messages are sent to the server and only appear in the UI after server confirmation.
     */
    const handleSend = () => {
        if (isConnected && text.trim() && currentUserId !== null) {
            // Optimistic update: Add message to state immediately with a temporary ID
            const tempMessage: ChatMessage = {
                id: null, // No real ID yet
                tempId: generateTempId(), // Assign a temporary ID
                senderProfileId: currentUserId,
                receiverProfileId: receiverId,
                content: text.trim(),
                timestamp: new Date().toISOString(), // Use current time for optimistic display
                readStatus: false, // Assuming it's unread until confirmed by backend
            };

            setChatMessages((prev) => {
                const newMessages = [...prev, tempMessage];
                return newMessages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
            });

            sendMessage(receiverId, text.trim()); // Send message via WebSocket
            setText(""); // Clear the input field
        } else {
            console.warn("Cannot send message: WebSocket not connected, message is empty, or current user ID is null.");
            // Optionally, provide user feedback (e.g., a toast notification)
        }
    };

    return (
        <div className="chat-page d-flex flex-column vh-100">
            {/* Chat Header */}
            <div className="chat-header px-3 pt-3 d-flex align-items-center border-bottom">
                <Button onClick={() => navigate("/matching")} className="d-flex align-items-center p-2">
                    <ArrowLeft size={20} className="me-1" /> Back
                </Button>
                <h3 className="text-center flex-grow-1 mb-0 pe-5">Chat with {receiverName}</h3>
            </div>

            {/* Chat Body - Messages Container handled by ChatMessageList */}
            <Container className="chat-body pt-2 flex-grow-1 d-flex flex-column">
                <ChatMessageList
                    chatMessages={chatMessages}
                    currentUserId={currentUserId}
                    receiverName={receiverName}
                    isLoading={isLoading}
                    messagesContainerRef={messagesContainerRef} // Pass ref for pagination scroll logic
                />
            </Container>

            {/* Chat Input Area handled by ChatInput */}
            <ChatInput
                text={text}
                setText={setText}
                handleSend={handleSend}
                isConnected={isConnected}
            />
        </div>
    );
};

export default ChatPage;