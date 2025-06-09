import { useState, useEffect, useCallback, useRef } from 'react';
import { useWebSocket } from '../providers/WebSocketProvider';
import apiClient from '../utils/apiClient';
import { ChatMessage } from '../types/ChatMessage';

const INITIAL_LOAD_COUNT = 10;
// Порог, выше которого автопрокрутка отключается.
// Например, если пользователь прокрутил на 100px вверх от самого низа, автопрокрутка отключается.
const SCROLL_DEACTIVATION_THRESHOLD = 100; 

interface UseChatLogicProps {
    receiverId: number;
    currentUserId: number;
}

const useChatLogic = ({ receiverId, currentUserId }: UseChatLogicProps) => {
    const { sendMessage, isConnected, registerMessageCallback, markMessagesAsReadForUser } = useWebSocket();

    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [text, setText] = useState<string>('');

    const messagesContainerRef = useRef<HTMLDivElement>(null);

    const isInitialLoadCompleteRef = useRef<boolean>(false);
    const hasScrolledUpToTopRef = useRef<boolean>(false); 
    // Новый реф для отслеживания, отключена ли автопрокрутка
    const isAutoScrollDisabledRef = useRef<boolean>(false);

    const generateTempId = (): string => `temp-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

    const handleIncomingMessage = useCallback((incomingMessage: ChatMessage) => {
        console.log('WebSocket: Incoming message received:', incomingMessage);

        const isMessageRelevant =
            (incomingMessage.senderProfileId === receiverId && incomingMessage.receiverProfileId === currentUserId) ||
            (incomingMessage.senderProfileId === currentUserId && incomingMessage.receiverProfileId === receiverId);

        if (!isMessageRelevant) {
            console.log('WebSocket: Message not relevant to this chat, ignoring.');
            return;
        }

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
                const sorted = updatedMessages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
                return sorted;
            }
            return prevMessages;
        });

        markMessagesAsReadForUser(receiverId);
    }, [receiverId, currentUserId, markMessagesAsReadForUser]);

    useEffect(() => {
        console.log('useEffect: Initial chat setup triggered.');
        if (!currentUserId || !receiverId) {
            console.log('useEffect: Missing currentUserId or receiverId. Aborting initial setup.');
            return;
        }

        setChatMessages([]);
        isInitialLoadCompleteRef.current = false;
        hasScrolledUpToTopRef.current = false;
        isAutoScrollDisabledRef.current = false; // Сбрасываем флаг автоскролла при инициализации чата
        console.log('useEffect: Chat states reset.');

        const loadInitialMessages = async () => {
            console.log('loadInitialMessages: Starting initial message load.');
            try {
                console.log(`loadInitialMessages: Fetching initial ${INITIAL_LOAD_COUNT} messages from page 0.`);
                const response = await apiClient.get<{ content: ChatMessage[], totalPages: number, number: number }>(`/messages`, {
                    params: {
                        otherUserProfileId: receiverId,
                        page: 0,
                        size: INITIAL_LOAD_COUNT,
                    },
                });
                
                const fetchedMessages = response.data.content;
                setChatMessages(fetchedMessages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()));
                console.log(`loadInitialMessages: Initial messages set: chatMessages.length=${fetchedMessages.length}`);

                setTimeout(() => {
                    if (messagesContainerRef.current) {
                        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
                        console.log('loadInitialMessages: Scrolled to bottom after initial load.');
                    }
                    isInitialLoadCompleteRef.current = true;
                    console.log('loadInitialMessages: isInitialLoadCompleteRef set to true.');
                }, 100);
                
            } catch (error) {
                console.error('loadInitialMessages: Error during initial history load:', error);
                setChatMessages([]);
            }
        };

        loadInitialMessages();

        console.log('useEffect: Registering WebSocket message callback.');
        const cleanupCallback = registerMessageCallback(receiverId, handleIncomingMessage);
        console.log('useEffect: Marking messages as read for receiver:', receiverId);
        markMessagesAsReadForUser(receiverId);

        return () => {
            console.log('useEffect: Cleanup function running.');
            cleanupCallback();
            markMessagesAsReadForUser(receiverId);
            console.log('useEffect: WebSocket callback unregistered and messages marked read on unmount.');
        };
    }, [receiverId, currentUserId, registerMessageCallback, markMessagesAsReadForUser, handleIncomingMessage]);

    /**
     * Хук эффекта для автоматической прокрутки до низа контейнера сообщений
     * при изменении `chatMessages` (то есть, при появлении нового сообщения).
     * Отключается, если пользователь прокрутил вверх выше заданного порога.
     */
    useEffect(() => {
        // Автоматическая прокрутка вниз срабатывает только после завершения первой загрузки
        // И только если автопрокрутка не отключена пользователем
        if (messagesContainerRef.current && isInitialLoadCompleteRef.current && !isAutoScrollDisabledRef.current) {
            console.log('useEffect [chatMessages]: Auto-scrolling due to new message (autoscroll enabled).');
            // Небольшая задержка, чтобы дать DOM обновиться
            setTimeout(() => {
                if (messagesContainerRef.current) {
                    messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
                }
            }, 0);
        } else if (isAutoScrollDisabledRef.current) {
            console.log('useEffect [chatMessages]: Auto-scrolling is disabled because user scrolled up.');
        }
    }, [chatMessages]);

    /**
     * Хук эффекта для обработки событий прокрутки на контейнере сообщений.
     * Определяет, когда отключать/включать автопрокрутку и логирует достижение верха.
     */
    useEffect(() => {
        const handleScroll = () => {
            if (messagesContainerRef.current) {
                const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
                
                // Расстояние от низа контейнера до текущей позиции скролла
                const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

                // Логика включения/отключения автопрокрутки
                if (distanceFromBottom > SCROLL_DEACTIVATION_THRESHOLD) {
                    // Если пользователь прокрутил выше порога, отключаем автопрокрутку
                    if (!isAutoScrollDisabledRef.current) {
                        isAutoScrollDisabledRef.current = true;
                        console.log(`Scroll Event: Auto-scrolling DISABLED. User scrolled up to ${distanceFromBottom}px from bottom.`);
                    }
                } else {
                    // Если пользователь прокрутил достаточно близко к низу, включаем автопрокрутку
                    if (isAutoScrollDisabledRef.current) {
                        isAutoScrollDisabledRef.current = false;
                        console.log(`Scroll Event: Auto-scrolling ENABLED. User scrolled back within ${SCROLL_DEACTIVATION_THRESHOLD}px of bottom.`);
                    }
                }

                // Логика срабатывания лога при достижении самого верха (не зависит от автопрокрутки)
                if (scrollTop <= 5) {
                    if (!hasScrolledUpToTopRef.current) {
                        console.log('Scroll Event: User scrolled to the very top! (No more messages to load here)');
                        hasScrolledUpToTopRef.current = true;
                    }
                } else {
                    if (hasScrolledUpToTopRef.current) {
                        hasScrolledUpToTopRef.current = false;
                        // console.log('Scroll Event: User scrolled away from the top.'); // Опциональный лог
                    }
                }
            }
        };

        const container = messagesContainerRef.current;
        if (container) {
            console.log('useEffect [scroll listener]: Adding scroll event listener.');
            container.addEventListener('scroll', handleScroll);
        }
        return () => {
            if (container) {
                console.log('useEffect [scroll listener]: Removing scroll event listener.');
                container.removeEventListener('scroll', handleScroll);
            }
        };
    }, []);

    const handleSend = useCallback(() => {
        console.log('handleSend: Attempting to send message.');
        if (isConnected && text.trim() && currentUserId !== null) {
            console.log('handleSend: Conditions met for sending message.');
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
                const sorted = newMessages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
                console.log('handleSend: Optimistic message added. New count:', sorted.length);
                return sorted;
            });

            sendMessage(receiverId, text.trim());
            setText('');
            console.log('handleSend: Message sent via WebSocket, input cleared.');
        } else {
            console.warn('handleSend: Cannot send message. Reasons:');
            if (!isConnected) console.warn('- WebSocket not connected.');
            if (!text.trim()) console.warn('- Message is empty.');
            if (currentUserId === null) console.warn('- Current user ID is null.');
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