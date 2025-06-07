export interface Message {
  id?: number;
  senderUsername: string;
  receiverUsername: string;
  content: string;
  timestamp?: string;
}