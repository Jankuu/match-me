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
    private Long senderId;
    @NonNull
    private Long receiverId;
    private String content;
    private LocalDateTime timestamp;

    public MessageDTO(Message message) {
        this.id = message.getId();
        this.senderId = message.getSenderId();
        this.receiverId = message.getReceiverId();
        this.content = message.getContent();
        this.timestamp = message.getTimestamp();
    }
}
