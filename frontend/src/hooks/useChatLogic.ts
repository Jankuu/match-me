import { useState, useEffect, useCallback, useRef } from "react";
import { useWebSocket } from "../providers/WebSocketProvider"; // Import WebSocket context for chat communication
import apiClient from "../utils/apiClient"; // Axios instance for API calls
import { ChatMessage } from "../types/ChatMessage"; // Type definition for a chat message

// Define the number of messages to load per pagination request
const PAGE_SIZE = 20;

/**
 * Props interface for the useChatLogic hook.
 * @param receiverId The ID of the user receiving messages in this chat.
 * @param currentUserId The ID of the currently authenticated user.
 */
interface UseChatLogicProps {
    receiverId: number;
    currentUserId: number;
}

/**
 * useChatLogic Custom Hook
 * This hook encapsulates all the core logic for a chat page, including:
 * - Managing chat messages state (display, optimistic updates)
 * - Handling message fetching with pagination
 * - Processing incoming real-time messages via WebSocket
 * - Sending messages
 * - Managing scroll behavior for message loading
 * - Tracking pagination state (current page, total pages, loading status, more data available)
 */
const useChatLogic = ({ receiverId, currentUserId }: UseChatLogicProps) => {
    // Destructure necessary functions and state from the WebSocket context
    const { sendMessage, isConnected, registerMessageCallback, markMessagesAsReadForUser } = useWebSocket();

    // --- State Management ---
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]); // Stores the list of messages in the current chat
    const [text, setText] = useState(""); // Stores the current input text for sending messages

    // Ref to the messages container DOM element for scroll management (e.g., auto-scroll, pagination scroll)
    const messagesContainerRef = useRef<HTMLDivElement>(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState<number>(0); // Current page number of loaded messages (0-indexed)
    const [totalPages, setTotalPages] = useState<number>(0); // Total number of available message pages
    const [isLoading, setIsLoading] = useState<boolean>(false); // Flag to indicate if messages are currently being loaded
    const [hasMore, setHasMore] = useState<boolean>(true); // Flag to indicate if there are more older messages to load

    // --- Refs for Mutable State in Effects ---
    // These refs are used to access the latest state values within event listeners and
    // memoized callbacks (like fetchMessages or handleScroll) without causing stale closures
    // or unnecessary re-renders of the effect due to state changes.
    const isLoadingRef = useRef(isLoading);
    isLoadingRef.current = isLoading;
    const currentPageRef = useRef(currentPage);
    currentPageRef.current = currentPage;
    const totalPagesRef = useRef(totalPages);
    totalPagesRef.current = totalPages;

    /**
     * Helper function to generate a unique temporary ID for optimistically added messages.
     * This ID is used until a real ID is received from the backend.
     * @returns A unique string starting with "temp-".
     */
    const generateTempId = (): string => `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    /**
     * Callback function to handle incoming real-time messages from the WebSocket.
     * This function is memoized with useCallback to ensure a stable reference.
     * It handles:
     * 1. Filtering messages not relevant to the current chat.
     * 2. Updating optimistically added messages with real backend IDs.
     * 3. Adding new incoming messages from other users.
     * 4. Deduplication of messages based on ID or content/timestamp (for temp IDs).
     * 5. Sorting messages chronologically.
     * 6. Marking messages as read for the current chat.
     * @param incomingMessage The ChatMessage object received from the WebSocket.
     */
    const handleIncomingMessage = useCallback((incomingMessage: ChatMessage) => {
        // Determine if the incoming message is relevant to this specific chat (sender-receiver pair)
        const isMessageRelevant =
            (incomingMessage.senderProfileId === receiverId && incomingMessage.receiverProfileId === currentUserId) ||
            (incomingMessage.senderProfileId === currentUserId && incomingMessage.receiverProfileId === receiverId);

        if (!isMessageRelevant) {
            return; // If not relevant, ignore the message.
        }

        // Use functional state update to ensure we always work with the latest `prevMessages`
        setChatMessages((prevMessages) => {
            let updatedMessages = [...prevMessages]; // Create a mutable copy of messages
            let messageAddedOrUpdated = false; // Flag to track if state needs an update

            // Case 1: Message has a real ID from the backend.
            // This applies to new messages from others or echoes of our own sent messages with their final ID.
            if (incomingMessage.id !== null && incomingMessage.id !== undefined) {
                // Try to find an existing message by real ID or by its temporary ID (if it's an echo of our own message)
                const existingIndex = updatedMessages.findIndex(
                    (msg) => msg.id === incomingMessage.id ||
                    (msg.tempId && // If it has a tempId (meaning it's an optimistic message)
                     msg.senderProfileId === incomingMessage.senderProfileId &&
                     msg.content === incomingMessage.content &&
                     // Compare timestamps with a small tolerance for uniqueness, as server might return slightly different ISO string
                     Math.abs(new Date(msg.timestamp).getTime() - new Date(incomingMessage.timestamp).getTime()) < 1000)
                );

                if (existingIndex > -1) {
                    // If an existing message is found:
                    // Check if it's an optimistic message needing an ID update (from tempId to real ID)
                    if (updatedMessages[existingIndex].id === null && incomingMessage.id !== null) {
                        updatedMessages[existingIndex] = { ...incomingMessage, tempId: undefined }; // Replace with real ID, remove tempId
                        messageAddedOrUpdated = true;
                    }
                    // Else: it's a duplicate of a message already with a real ID, so no update needed.
                } else {
                    // If no existing message is found, it's a new message (e.g., from another user with a real ID)
                    updatedMessages.push(incomingMessage);
                    messageAddedOrUpdated = true;
                }
            } else {
                // Case 2: Message has ID as null (it's either an initial optimistic push or a backend message without a real ID).
                // We primarily rely on content, sender, receiver, and timestamp for deduplication here.
                const isAlreadyPresentByContent = updatedMessages.some(
                    (msg) => msg.content === incomingMessage.content &&
                             msg.senderProfileId === incomingMessage.senderProfileId &&
                             msg.receiverProfileId === incomingMessage.receiverProfileId &&
                             Math.abs(new Date(msg.timestamp).getTime() - new Date(incomingMessage.timestamp).getTime()) < 1000
                );

                if (!isAlreadyPresentByContent) {
                    // If not already present, add it with a temporary ID for optimistic display
                    const messageWithTempId = { ...incomingMessage, tempId: generateTempId() };
                    updatedMessages.push(messageWithTempId);
                    messageAddedOrUpdated = true;
                }
            }

            // Only update the state if a message was actually added or updated
            if (messageAddedOrUpdated) {
                // Sort messages to maintain strict chronological order by timestamp
                return updatedMessages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
            }
            return prevMessages; // Return previous state if no change occurred
        });

        // From Sten
        const setLoadedMessages = (loadedMessages: ChatMessage[]) => {
            setChatMessages(loadedMessages);
        };
        
        // After processing the message, mark messages in this chat as read.
        // This is important for real-time read status updates.
        markMessagesAsReadForUser(receiverId);
    }, [receiverId, currentUserId, markMessagesAsReadForUser]); // Dependencies for useCallback

    /**
     * Fetches message history for the current chat session from the backend.
     * This function is memoized with useCallback.
     * It handles:
     * - Pagination logic (loading older pages).
     * - Adjusting scroll position after loading older messages to prevent jumping.
     * - Initial loading of the last page of messages and scrolling to the bottom.
     * @param pageToLoad The page number to load (0-indexed).
     * @param initialScroll True if this is the initial load (scroll to bottom), false otherwise (scroll to maintain position).
     */
    const fetchMessages = useCallback(async (pageToLoad: number, initialScroll: boolean = false) => {
        // Prevent fetching if required IDs are missing, already loading, or page is out of bounds
        if (!currentUserId || !receiverId || isLoadingRef.current) {
            return;
        }
        if (pageToLoad < 0 || (totalPagesRef.current > 0 && pageToLoad >= totalPagesRef.current)) {
            setHasMore(false); // No more pages to load if current page is 0 or beyond total
            return;
        }

        setIsLoading(true); // Set loading state to true
        // Capture current scroll height before new messages are added (for scroll adjustment)
        const previousScrollHeight = messagesContainerRef.current ? messagesContainerRef.current.scrollHeight : 0;

        try {
            // Make API request to fetch messages for the specified page
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

            // Ensure fetched messages are sorted chronologically
            const sortedFetchedMessages = fetchedMessages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

            setChatMessages((prev) => {
                let combinedMessages: ChatMessage[];
                if (initialScroll) {
                    // For initial load, replace all messages with the fetched ones
                    combinedMessages = sortedFetchedMessages;
                } else {
                    // When loading older messages, prepend them to the existing list
                    combinedMessages = [...sortedFetchedMessages, ...prev];
                }

                // Deduplicate messages, prioritizing those with real IDs over temporary ones
                const uniqueMessagesMap = new Map<number | string, ChatMessage>();
                for (const msg of combinedMessages) {
                    const key = msg.id !== null && msg.id !== undefined ? msg.id : msg.tempId;
                    if (key !== undefined) {
                        uniqueMessagesMap.set(key, msg);
                    }
                }
                
                // Convert map values back to an array and re-sort to ensure correct order
                return Array.from(uniqueMessagesMap.values()).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
            });

            // Update pagination states
            setTotalPages(newTotalPages);
            setCurrentPage(fetchedPageNumber);
            setHasMore(fetchedPageNumber > 0); // If fetchedPageNumber is 0, it means we're on the first page, so no more older messages

            // Scroll adjustment logic
            if (initialScroll) {
                // For initial load, scroll to the very bottom
                setTimeout(() => {
                    if (messagesContainerRef.current) {
                        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
                    }
                }, 100); // Small delay to ensure DOM update
            } else if (messagesContainerRef.current) {
                // When loading older messages, adjust scroll to maintain current view
                setTimeout(() => {
                    if (messagesContainerRef.current) {
                        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight - previousScrollHeight;
                    }
                }, 0); // No delay, but ensures it runs after state update
            }

        } catch (error) {
            console.error("Error fetching message history:", error);
            setHasMore(false); // Assume no more messages if there's an error
        } finally {
            setIsLoading(false); // Clear loading state
        }
    }, [currentUserId, receiverId]); // Dependencies for useCallback

    /**
     * Effect hook for initial message history load when the chat component mounts
     * or when the current user/receiver changes.
     * It also registers the WebSocket message callback and marks messages as read.
     */
    useEffect(() => {
        const fetchChatLog = async () => {
            try {
                const res = await apiClient.get(
                    `/messages?otherUserProfileId=${receiverId}&page=${0}&size=${10}`
                );
                console.log(res.data.content);
                setChatMessages(res.data.content);
            } catch (error) {
                console.error("Failed to fetch messages", error);
            }
        };
        fetchChatLog();
    }, []);

    useEffect(() => {
        if (!currentUserId || !receiverId) return; // Ensure valid IDs before proceeding

        // Reset all chat-related states for a fresh chat session
        setChatMessages([]);
        setCurrentPage(0);
        setTotalPages(0);
        setIsLoading(false);
        setHasMore(true);

        // Async function to handle initial message loading
        const loadInitialMessages = async () => {
            if (isLoadingRef.current) return; // Prevent double loading

            setIsLoading(true);
            try {
                // First, make a small request to get the total number of pages metadata
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
                    // Load the LAST page of messages for initial display to show recent history
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

        // Register WebSocket callback for real-time messages for this specific receiver
        const cleanupCallback = registerMessageCallback(receiverId, handleIncomingMessage);
        // Mark existing messages as read when entering the chat
        markMessagesAsReadForUser(receiverId);

        // Cleanup function for when the component unmounts or dependencies change
        return () => {
            cleanupCallback(); // Unregister the WebSocket callback to prevent memory leaks/stale updates
            markMessagesAsReadForUser(receiverId); // Mark messages read when leaving chat as well
        };
    }, [receiverId, currentUserId, registerMessageCallback, markMessagesAsReadForUser, handleIncomingMessage, fetchMessages]); // Dependencies

    /**
     * Effect hook to scroll to the bottom of the messages container whenever
     * `chatMessages` array changes (e.g., new message received/sent).
     */
    useEffect(() => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
    }, [chatMessages]); // Dependency: chatMessages

    /**
     * Effect hook for handling scroll events on the messages container to load older messages.
     * It adds and removes a scroll event listener.
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
    }, [hasMore, fetchMessages]); // Dependencies: hasMore (to know if there's more to load) and fetchMessages (which is stable due to useCallback)

    /**
     * Handles sending a message when the send button is clicked or Enter is pressed.
     * This function is memoized with useCallback.
     * It performs an optimistic update, adding the message to the UI immediately with a temporary ID.
     * The actual message is then sent via WebSocket.
     */
    const handleSend = useCallback(() => {
        // Ensure WebSocket is connected, message text is not empty, and current user ID is valid
        if (isConnected && text.trim() && currentUserId !== null) {
            // Create a temporary ChatMessage object for optimistic display
            const tempMessage: ChatMessage = {
                id: null, // No real ID yet, it will be assigned by backend
                tempId: generateTempId(), // Assign a temporary ID for local tracking
                senderProfileId: currentUserId,
                receiverProfileId: receiverId,
                content: text.trim(),
                timestamp: new Date().toISOString(), // Use current time for optimistic display
                readStatus: false, // Optimistically unread until confirmed by backend/receiver
            };

            // Add the temporary message to the chat messages state
            setChatMessages((prev) => {
                const newMessages = [...prev, tempMessage];
                // Re-sort to maintain chronological order in case of concurrent events
                return newMessages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
            });

            sendMessage(receiverId, text.trim()); // Send the message payload via WebSocket
            setText(""); // Clear the input field after sending
        } else {
            console.warn("Cannot send message: WebSocket not connected, message is empty, or current user ID is null.");
            // Optionally, provide user feedback (e.g., a toast notification)
        }
    }, [isConnected, text, currentUserId, receiverId, sendMessage]); // Dependencies for useCallback

    // --- Return Values ---
    // The hook returns all the state and functions that the ChatPage component needs to render the chat UI.
    return {
        chatMessages,       // Array of messages to display
        text,               // Current input text
        setText,            // Function to update input text
        handleSend,         // Function to send a message
        isLoading,          // Boolean indicating if messages are loading
        messagesContainerRef, // Ref to the messages scroll container
        isConnected,        // Boolean indicating WebSocket connection status
    };
};

export default useChatLogic;