// src/types/Message.ts
export interface Message {
  id?: number; // Optional, if messages have IDs from the backend
  senderProfileId: number;
  receiverProfileId: number;
  content: string;
  timestamp: string; // ISO 8601 string, e.g., "2023-10-27T10:00:00Z"
  // Add any other fields your backend sends, e.g., 'readStatus', 'type'
}