package com.example.demo.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.LocalDateTime;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "messages")
public class Message {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NonNull
    private Long receiverProfileId;
    @NonNull
    private Long senderProfileId;

    @NonNull
    @NotBlank
    @Column(length = 300)
    private String content;

    @NonNull
    private LocalDateTime timestamp;

    private boolean hasReceiverRead;
}