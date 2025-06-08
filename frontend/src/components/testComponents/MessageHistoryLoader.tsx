// src/components/testComponents/MessageHistoryLoader.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import apiClient from '../../utils/apiClient'; // Убедитесь, что путь верен
import { ChatMessage } from '../../types/ChatMessage'; // Убедитесь, что путь верен
import { Spinner, Button } from 'react-bootstrap';
import '../../styles/ChatPage.css'; // Убедитесь, что путь верен

// Определение типа для пропсов компонента
interface MessageHistoryLoaderProps {
    currentUserId: number;
    receiverId: number;
    // Опционально: колбэк для получения загруженных сообщений в родительский компонент/тест
    onMessagesLoaded?: (messages: ChatMessage[], page: number, totalPages: number) => void;
}

// Размер страницы для загрузки сообщений
const PAGE_SIZE = 20;

const MessageHistoryLoader: React.FC<MessageHistoryLoaderProps> = ({
    currentUserId,
    receiverId,
    onMessagesLoaded,
}) => {
    // Состояние для хранения загруженных сообщений
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    // Текущий номер страницы, которую мы отображаем (или с которой начали загрузку)
    const [currentPage, setCurrentPage] = useState<number>(0);
    // Общее количество доступных страниц сообщений (используем как ориентир, но не абсолютно доверяем)
    const [totalPages, setTotalPages] = useState<number>(0);
    // Индикатор загрузки (true, когда идёт запрос к бэкенду)
    const [isLoading, setIsLoading] = useState<boolean>(false);
    // Флаг, указывающий, есть ли ещё более старые сообщения для загрузки
    const [hasMore, setHasMore] = useState<boolean>(true); // Начинаем с предположения, что есть

    // Ссылка на DOM-элемент контейнера сообщений для управления прокруткой
    const containerRef = useRef<HTMLDivElement>(null);

    // Ref-ы для стабильного доступа к актуальным значениям состояния внутри useCallback/useEffect
    const isLoadingRef = useRef(isLoading);
    isLoadingRef.current = isLoading;
    const currentPageRef = useRef(currentPage);
    currentPageRef.current = currentPage;
    const totalPagesRef = useRef(totalPages);
    totalPagesRef.current = totalPages;
    const hasMoreRef = useRef(hasMore); // Добавляем реф для hasMore
    hasMoreRef.current = hasMore;


    /**
     * Асинхронная функция для загрузки сообщений с бэкенда.
     * @param pageToLoad Номер страницы для загрузки.
     * @param initialLoad Флаг, указывающий, является ли это первоначальной загрузкой (для корректировки прокрутки).
     */
    const fetchMessages = useCallback(async (pageToLoad: number, initialLoad: boolean = false) => {
        // Предотвращение загрузки, если данные отсутствуют или уже идёт загрузка
        if (!currentUserId || !receiverId || isLoadingRef.current) {
            console.log("Fetch aborted (test component): Missing IDs or already loading.", { currentUserId, receiverId, isLoading: isLoadingRef.current });
            return;
        }

        // Перед запросом проверяем, если мы уже знаем, что страниц больше нет,
        // или если запрашиваемая страница явно некорректна (например, отрицательная).
        // Проверка `pageToLoad >= totalPagesRef.current` теперь менее строгая,
        // так как totalPages может быть неверным. Мы больше полагаемся на то,
        // что вернёт бэкенд (наличие сообщений).
        if (pageToLoad < 0 || (!initialLoad && !hasMoreRef.current)) {
            // console.log("No more pages to load or invalid page number (test component):", pageToLoad, "Total pages:", totalPagesRef.current);
            return;
        }

        setIsLoading(true); // Устанавливаем флаг загрузки
        console.log(`FETCH START (test component): page=${pageToLoad}, size=${PAGE_SIZE}, initialLoad=${initialLoad}`);

        // Сохраняем высоту контейнера до загрузки новых сообщений для корректной прокрутки
        const previousScrollHeight = containerRef.current ? containerRef.current.scrollHeight : 0;

        try {
            // Отправка GET-запроса к API
            const response = await apiClient.get<{ content: ChatMessage[], totalPages: number, number: number }>(`/messages`, {
                params: {
                    otherUserProfileId: receiverId,
                    page: pageToLoad,
                    size: PAGE_SIZE,
                },
            });

            const fetchedMessages = response.data.content; // Полученные сообщения
            const newTotalPages = response.data.totalPages; // Общее количество страниц из ТЕКУЩЕГО ответа
            const fetchedPageNumber = response.data.number; // Номер полученной страницы

            console.log(`FETCH SUCCESS (test component): Fetched ${fetchedMessages.length} messages. New total pages: ${newTotalPages}, Fetched page number: ${fetchedPageNumber}`);

            // Сортируем полученные сообщения по времени (восходящий порядок, от старых к новым)
            const sortedFetchedMessages = fetchedMessages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

            setMessages((prev) => {
                let combinedMessages: ChatMessage[];
                if (initialLoad) {
                    // При первой загрузке (когда получаем последнюю страницу) просто заменяем сообщения
                    combinedMessages = sortedFetchedMessages;
                } else {
                    // При загрузке старых сообщений (скролл вверх) добавляем их в начало
                    combinedMessages = [...sortedFetchedMessages, ...prev];
                }

                // Дедупликация сообщений по `id` или `tempId`
                const uniqueMessagesMap = new Map<number | string, ChatMessage>();
                for (const msg of combinedMessages) {
                    const key = msg.id !== null && msg.id !== undefined ? msg.id : msg.tempId;
                    if (key !== undefined) {
                        uniqueMessagesMap.set(key, msg);
                    }
                }
                const uniqueMessages = Array.from(uniqueMessagesMap.values());

                // Итоговая сортировка всех уникальных сообщений
                const finalSortedMessages = uniqueMessages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
                console.log(`SET MESSAGES (test component): Total unique messages after update: ${finalSortedMessages.length}`);
                return finalSortedMessages;
            });

            // Обновляем totalPages и currentPage на основе последнего ответа
            setTotalPages(newTotalPages);
            totalPagesRef.current = newTotalPages;
            setCurrentPage(fetchedPageNumber);

            // *** ГЛАВНОЕ ИЗМЕНЕНИЕ ЛОГИКИ HASMORE ***
            // Определяем hasMore, основываясь на наличии сообщений и номере страницы.
            // Если мы получили 0 сообщений, это означает, что больше сообщений нет,
            // или мы запросили страницу, которая находится за пределами существующих.
            // Исключение: при первой загрузке (initialLoad) мы можем запросить страницу N,
            // и она может быть пустой, если на бэкенде нет сообщений.
            // Если fetchedMessages.length === 0, то история закончилась.
            // Также, если fetchedPageNumber == 0, значит, мы на самой старой странице.
            setHasMore(fetchedMessages.length > 0 && fetchedPageNumber > 0);
            // Эта логика означает: "hasMore" только если мы получили какие-то сообщения И это не самая первая (нулевая) страница.
            // Если мы получили 0 сообщений, hasMore становится false (независимо от fetchedPageNumber).
            // Если мы на странице 0, hasMore становится false.


            // Оповещаем родительский компонент/тест о загруженных сообщениях
            onMessagesLoaded?.(sortedFetchedMessages, fetchedPageNumber, newTotalPages);

            // Корректировка прокрутки после обновления DOM
            setTimeout(() => {
                if (containerRef.current) {
                    if (initialLoad) {
                        // При первой загрузке прокручиваем в самый низ чата
                        containerRef.current.scrollTop = containerRef.current.scrollHeight;
                        console.log("Initial scroll to bottom completed (test component).");
                    } else {
                        // При загрузке старых сообщений, корректируем прокрутку,
                        // чтобы пользователь остался на том же месте относительно сообщений
                        containerRef.current.scrollTop = containerRef.current.scrollHeight - previousScrollHeight;
                        console.log("Scroll adjusted after loading older messages (test component).");
                    }
                }
            }, 0);
        } catch (error) {
            console.error("Error fetching message history (test component):", error);
            setHasMore(false); // При ошибке предполагаем, что больше сообщений нет
        } finally {
            setIsLoading(false); // Завершаем состояние загрузки
        }
    }, [currentUserId, receiverId, onMessagesLoaded]); // Зависимости useCallback

    /**
     * Эффект для первоначальной загрузки сообщений при монтировании компонента
     * или изменении currentUserId/receiverId.
     */
    useEffect(() => {
        // Пропускаем загрузку, если ID пользователей не определены
        if (!currentUserId || !receiverId) {
            console.log("Skipping initial load: currentUserId or receiverId not available (test component).");
            return;
        }

        // Сброс состояния для новой сессии чата (если IDs изменились)
        setMessages([]);
        setCurrentPage(0);
        setTotalPages(0);
        setIsLoading(false);
        setHasMore(true); // Начинаем с предположения, что история есть
        console.log("INITIAL LOAD EFFECT TRIGGERED: Resetting state.");


        const loadInitialMessages = async () => {
            if (isLoadingRef.current) {
                console.log("Already loading, aborting initial load (test component).");
                return;
            }
            setIsLoading(true); // Начинаем загрузку

            try {
                // Шаг 1: Запрос с size=1, чтобы получить общее количество страниц (totalPages)
                // Этот запрос по-прежнему нужен, чтобы узнать "предполагаемое" количество страниц
                // и запросить последнюю. Однако, если бэкенд врет тут, мы будем это обрабатывать.
                console.log("INITIAL LOAD (Step 1): Requesting total pages (page=0, size=1)");
                const initialResponse = await apiClient.get<{ totalPages: number }>(`/messages`, {
                    params: {
                        otherUserProfileId: receiverId,
                        page: 0,
                        size: 1, // Запрашиваем только 1 элемент, чтобы получить метаданные
                    },
                });
                const totalAvailablePages = initialResponse.data.totalPages;
                totalPagesRef.current = totalAvailablePages; // Обновляем реф для fetchMessages
                console.log(`INITIAL LOAD (Step 1 SUCCESS): Total pages from backend: ${totalAvailablePages}`);

                if (totalAvailablePages > 0) {
                    // Шаг 2: Загружаем ПОСЛЕДНЮЮ страницу сообщений для отображения
                    const pageToFetch = totalAvailablePages - 1;
                    console.log(`INITIAL LOAD (Step 2): Fetching last page (${pageToFetch}) of messages.`);
                    await fetchMessages(pageToFetch, true); // true указывает на первую загрузку
                } else {
                    // Если бэкенд изначально сказал, что totalPages = 0, то сообщений нет
                    setMessages([]);
                    setHasMore(false);
                    console.log("INITIAL LOAD (Step 2): No messages available for this chat.");
                }
            } catch (error) {
                console.error("Error during initial history load (test component):", error);
                setHasMore(false); // При ошибке считаем, что истории нет
            } finally {
                setIsLoading(false); // Завершаем загрузку
                console.log("INITIAL LOAD EFFECT FINISHED.");
            }
        };

        loadInitialMessages();

        // Очистка при размонтировании компонента (если нужно отменить что-то)
        return () => {
            // Например, отменить HTTP-запросы, если они ещё выполняются.
            // Для Axios можно использовать CancelToken.
        };
    }, [currentUserId, receiverId, fetchMessages]); // Зависимости useEffect

    /**
     * Эффект для обработки события прокрутки контейнера сообщений.
     * Отвечает за подгрузку старых сообщений при прокрутке к верху.
     */
    useEffect(() => {
        const handleScroll = () => {
            if (containerRef.current) {
                const { scrollTop } = containerRef.current;
                // Проверяем, если пользователь прокрутил к самому верху (в пределах 5px),
                // и при этом не идёт загрузка, и есть более старые страницы, и есть ещё сообщения
                if (scrollTop <= 5 && !isLoadingRef.current && hasMoreRef.current) {
                    // Здесь мы больше не используем currentPageRef.current > 0 напрямую в условии
                    // потому что hasMoreRef.current уже учитывает, есть ли смысл запрашивать предыдущую страницу
                    // (например, если currentPageRef.current уже 0, hasMoreRef.current должен быть false).
                    // Однако, для безопасности, мы всё же запросим currentPageRef.current - 1
                    // и пусть fetchMessages сам решит, можно ли это сделать.
                    const pageToLoad = currentPageRef.current - 1;
                    if (pageToLoad >= 0) { // Проверяем, что не пытаемся загрузить отрицательную страницу
                        console.log("Scrolled to top, fetching previous page (test component):", pageToLoad);
                        fetchMessages(pageToLoad); // Загрузить предыдущую страницу
                    } else {
                        setHasMore(false); // Уже на самой первой странице
                    }
                }
            }
        };

        const container = containerRef.current;
        if (container) {
            // Добавляем слушатель события прокрутки
            container.addEventListener('scroll', handleScroll);
        }

        // Функция очистки: удаляем слушатель события при размонтировании компонента
        return () => {
            if (container) {
                container.removeEventListener('scroll', handleScroll);
            }
        };
    }, [fetchMessages]); // Зависимости useEffect: fetchMessages (стабильная функция)


    return (
        <div className="chat-page d-flex flex-column vh-100">
            <div className="chat-header px-3 pt-3 d-flex align-items-center border-bottom">
                <h3 className="text-center flex-grow-1 mb-0 pe-5">
                    Test Chat History ({currentUserId} & {receiverId})
                </h3>
            </div>
            <div className="chat-body pt-2 flex-grow-1 d-flex flex-column" ref={containerRef}>
                {isLoading && (
                    <div className="text-center py-2">
                        <Spinner animation="border" size="sm" /> Loading older messages...
                    </div>
                )}
                {/* Отображаем "No messages yet.", если нет сообщений и не идёт загрузка */}
                {messages.length === 0 && !isLoading ? (
                    <div className="text-muted text-center py-5">No messages yet.</div>
                ) : (
                    // Рендерим сообщения
                    messages.map((msg) => (
                        <div
                            // Используем id или tempId для ключа
                            key={msg.id !== null && msg.id !== undefined ? msg.id : msg.tempId || `temp-${Math.random()}`}
                            className={`message-bubble ${msg.senderProfileId === currentUserId ? "mine" : "theirs"}`}
                        >
                            <div className="message-content">{msg.content}</div>
                            <div className="message-timestamp">
                                {new Date(msg.timestamp).toLocaleString()}
                            </div>
                        </div>
                    ))
                )}
                {/* Сообщение, когда вся история загружена */}
                {/* !hasMore: если больше нет сообщений И messages.length > 0: если есть хоть какие-то сообщения */}
                {!hasMore && messages.length > 0 && (
                    <div className="text-muted text-center py-2">No more messages in history.</div>
                )}
            </div>
            <div className="p-3 border-top text-center">
                <p>Current Page: {currentPage} / Total Pages: {totalPages}</p>
                <p>Has More: {hasMore ? "Yes" : "No"}</p>
                {/* Кнопка для ручной проверки подгрузки старых сообщений */}
                <Button onClick={() => fetchMessages(currentPage - 1)} disabled={isLoading || !hasMore || currentPage === 0}>
                    Load Older (Manual Test)
                </Button>
            </div>
        </div>
    );
};

export default MessageHistoryLoader;