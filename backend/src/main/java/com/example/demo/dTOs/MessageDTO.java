package com.example.demo.dTOs;

import com.example.demo.entities.Message;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MessageDTO {
    private Long id;

    private Long senderProfileId;
    private Long receiverProfileId;

    private String content;
    private LocalDateTime timestamp;

    public MessageDTO(Message message) {
        this.id = message.getId();
        this.senderProfileId = message.getSenderProfileId();
        this.receiverProfileId = message.getReceiverProfileId();
        this.content = message.getContent();
        this.timestamp = message.getTimestamp();
    }
}
