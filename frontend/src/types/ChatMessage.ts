// src/types/ChatMessage.ts

export interface ChatMessage {
    id: number | null; // Allow ID to be null
    senderProfileId: number;
    receiverProfileId: number;
    content: string;
    timestamp: string;
    readStatus?: boolean; // Optional: if you track read status
    tempId?: string; // Add a temporary ID for frontend deduplication
}