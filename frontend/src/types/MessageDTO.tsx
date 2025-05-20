export interface MessageDTO {
  id?: number;
  senderUsername: string;
  receiverUsername: string;
  content: string;
  timestamp?: string;
}