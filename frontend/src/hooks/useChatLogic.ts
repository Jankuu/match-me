import { useState, useEffect, useCallback, useRef } from 'react';
import { useWebSocket } from '../providers/WebSocketProvider';
import apiClient from '../utils/apiClient';
import { ChatMessage } from '../types/ChatMessage';

const INITIAL_LOAD_COUNT = 10;
const SCROLL_DEACTIVATION_THRESHOLD = 100; 

interface UseChatLogicProps {
    receiverId: number;
    currentUserId: number;
}

const useChatLogic = ({ receiverId, currentUserId }: UseChatLogicProps) => {
    const { sendMessage, isConnected, registerMessageCallback, markMessagesAsReadForUser } = useWebSocket();

    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [text, setText] = useState<string>('');
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState<number | null>(null);
    const [isLoadingOlderMessages, setIsLoadingOlderMessages] = useState(false);

    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const isInitialLoadCompleteRef = useRef<boolean>(false);
    const hasScrolledUpToTopRef = useRef<boolean>(false);
    const isAutoScrollDisabledRef = useRef<boolean>(false);

    const generateTempId = (): string => `temp-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

    const handleIncomingMessage = useCallback((incomingMessage: ChatMessage) => {
        const isMessageRelevant =
            (incomingMessage.senderProfileId === receiverId && incomingMessage.receiverProfileId === currentUserId) ||
            (incomingMessage.senderProfileId === currentUserId && incomingMessage.receiverProfileId === receiverId);

        if (!isMessageRelevant) return;

        setChatMessages((prevMessages) => {
            let updatedMessages = [...prevMessages];
            let messageAddedOrUpdated = false;

            if (incomingMessage.id !== null && incomingMessage.id !== undefined) {
                const existingIndex = updatedMessages.findIndex(
                    (msg) => msg.id === incomingMessage.id ||
                    (msg.tempId &&
                     msg.senderProfileId === incomingMessage.senderProfileId &&
                     msg.content === incomingMessage.content &&
                     Math.abs(new Date(msg.timestamp).getTime() - new Date(incomingMessage.timestamp).getTime()) < 1000)
                );

                if (existingIndex > -1) {
                    if (updatedMessages[existingIndex].id === null && incomingMessage.id !== null) {
                        updatedMessages[existingIndex] = { ...incomingMessage, tempId: undefined };
                        messageAddedOrUpdated = true;
                    }
                } else {
                    updatedMessages.push(incomingMessage);
                    messageAddedOrUpdated = true;
                }
            } else {
                const isAlreadyPresentByContent = updatedMessages.some(
                    (msg) => msg.content === incomingMessage.content &&
                             msg.senderProfileId === incomingMessage.senderProfileId &&
                             msg.receiverProfileId === incomingMessage.receiverProfileId &&
                             Math.abs(new Date(msg.timestamp).getTime() - new Date(incomingMessage.timestamp).getTime()) < 1000
                );

                if (!isAlreadyPresentByContent) {
                    const messageWithTempId: ChatMessage = { ...incomingMessage, tempId: generateTempId() };
                    updatedMessages.push(messageWithTempId);
                    messageAddedOrUpdated = true;
                }
            }

            if (messageAddedOrUpdated) {
                return updatedMessages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
            }
            return prevMessages;
        });

        markMessagesAsReadForUser(receiverId);
    }, [receiverId, currentUserId, markMessagesAsReadForUser]);

    function mergeMessagesWithoutDuplicates(existing: ChatMessage[], incoming: ChatMessage[]): ChatMessage[] {
        const existingIds = new Set(existing.map(m => m.id ?? m.tempId));
        const filteredIncoming = incoming.filter(m => !existingIds.has(m.id ?? m.tempId));
        return [...filteredIncoming, ...existing].sort(
            (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
    }

    const loadOlderMessages = async () => {
        if (isLoadingOlderMessages || (totalPages !== null && currentPage + 1 >= totalPages)) return;

        setIsLoadingOlderMessages(true);
        try {
            const nextPage = currentPage + 1;
            const prevScrollHeight = messagesContainerRef.current?.scrollHeight || 0;

            const response = await apiClient.get<{ content: ChatMessage[], totalPages: number, number: number }>(`/messages`, {
                params: {
                    otherUserProfileId: receiverId,
                    page: nextPage,
                    size: INITIAL_LOAD_COUNT,
                },
            });

            const newMessages = response.data.content;
            setTotalPages(response.data.totalPages);
            setCurrentPage(nextPage);

            setChatMessages((prevMessages) =>
                mergeMessagesWithoutDuplicates(prevMessages, newMessages)
            );

            setTimeout(() => {
                if (messagesContainerRef.current) {
                    const newScrollHeight = messagesContainerRef.current.scrollHeight;
                    messagesContainerRef.current.scrollTop = newScrollHeight - prevScrollHeight;
                }
            }, 50);
        } catch (error) {
            console.error("loadOlderMessages: Error loading older messages:", error);
        } finally {
            setIsLoadingOlderMessages(false);
        }
    };

    useEffect(() => {
        if (!currentUserId || !receiverId) return;

        setChatMessages([]);
        isInitialLoadCompleteRef.current = false;
        hasScrolledUpToTopRef.current = false;
        isAutoScrollDisabledRef.current = false;

        const loadInitialMessages = async () => {
            try {
                const response = await apiClient.get<{ content: ChatMessage[], totalPages: number, number: number }>(`/messages`, {
                    params: {
                        otherUserProfileId: receiverId,
                        page: 0,
                        size: INITIAL_LOAD_COUNT,
                    },
                });

                const fetchedMessages = response.data.content;
                setChatMessages(fetchedMessages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()));
                setCurrentPage(0);
                setTotalPages(response.data.totalPages);

                setTimeout(() => {
                    if (messagesContainerRef.current) {
                        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
                    }
                    isInitialLoadCompleteRef.current = true;
                }, 100);
            } catch (error) {
                console.error('loadInitialMessages: Error during initial history load:', error);
                setChatMessages([]);
            }
        };

        loadInitialMessages();

        const cleanupCallback = registerMessageCallback(receiverId, handleIncomingMessage);
        markMessagesAsReadForUser(receiverId);

        return () => {
            cleanupCallback();
            markMessagesAsReadForUser(receiverId);
        };
    }, [receiverId, currentUserId, registerMessageCallback, markMessagesAsReadForUser, handleIncomingMessage]);

    useEffect(() => {
        if (messagesContainerRef.current && isInitialLoadCompleteRef.current && !isAutoScrollDisabledRef.current) {
            setTimeout(() => {
                if (messagesContainerRef.current) {
                    messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
                }
            }, 0);
        }
    }, [chatMessages]);

    useEffect(() => {
        const handleScroll = () => {
            if (messagesContainerRef.current) {
                const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
                const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

                if (distanceFromBottom > SCROLL_DEACTIVATION_THRESHOLD) {
                    if (!isAutoScrollDisabledRef.current) {
                        isAutoScrollDisabledRef.current = true;
                        console.log(`Scroll Event: Auto-scrolling DISABLED. User scrolled up to ${distanceFromBottom}px from bottom.`);
                    }
                } else {
                    if (isAutoScrollDisabledRef.current) {
                        isAutoScrollDisabledRef.current = false;
                        console.log(`Scroll Event: Auto-scrolling ENABLED. User scrolled back within ${SCROLL_DEACTIVATION_THRESHOLD}px of bottom.`);
                    }
                }

                if (isInitialLoadCompleteRef.current && scrollTop <= 5) {
                    if (!hasScrolledUpToTopRef.current) {
                        hasScrolledUpToTopRef.current = true;
                        loadOlderMessages();
                        console.log('Scroll Event: User scrolled to the very top!');
                    }
                } else {
                    if (hasScrolledUpToTopRef.current) {
                        hasScrolledUpToTopRef.current = false;
                    }
                }
            }
        };

        const container = messagesContainerRef.current;
        if (container) {
            container.addEventListener('scroll', handleScroll);
        }
        return () => {
            if (container) {
                container.removeEventListener('scroll', handleScroll);
            }
        };
    }, [loadOlderMessages]);

    const handleSend = useCallback(() => {
        if (isConnected && text.trim() && currentUserId !== null) {
            const tempMessage: ChatMessage = {
                id: null,
                tempId: generateTempId(),
                senderProfileId: currentUserId,
                receiverProfileId: receiverId,
                content: text.trim(),
                timestamp: new Date().toISOString(),
                readStatus: false,
            };

            setChatMessages((prev) => {
                const newMessages = [...prev, tempMessage];
                return newMessages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
            });

            sendMessage(receiverId, text.trim());
            setText('');
        }
    }, [isConnected, text, currentUserId, receiverId, sendMessage]);

    return {
        chatMessages,
        text,
        setText,
        handleSend,
        messagesContainerRef,
        isConnected,
    };
};

export default useChatLogic;
