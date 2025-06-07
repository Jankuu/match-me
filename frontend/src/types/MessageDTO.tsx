export interface MessageDTO {
    id?: number;
    senderProfileId: number;
    receiverProfileId: number;
    content: string;
    timestamp?: string;
    hasReceiverRead: boolean;
}
