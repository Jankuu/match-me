package com.example.demo.dTOs;

import com.example.demo.entities.Connection;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class ConnectionDTO {
    private Long id;
    private UserProfileDTO receiver;
    private UserProfileDTO sender;
    private LocalDateTime createdAt;

    public ConnectionDTO(Connection connection) {
        this.id = connection.getId();
        this.receiver = new UserProfileDTO(connection.getReceiver());
        this.sender = new UserProfileDTO(connection.getSender());
        this.createdAt = connection.getCreatedAt();
    }
}
