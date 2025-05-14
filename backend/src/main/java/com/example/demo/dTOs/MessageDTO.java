package com.example.demo.dTOs;

import com.example.demo.entities.Message;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MessageDTO {
    private Long id;
    @NonNull
    private String senderUsername;
    @NonNull
    private String receiverUsername;
    private String content;
    private LocalDateTime timestamp;

    public MessageDTO(Message message) {
        this.id = message.getId();
        this.senderUsername = message.getSenderUsername();
        this.receiverUsername = message.getReceiverUsername();
        this.content = message.getContent();
        this.timestamp = message.getTimestamp();
    }
}
