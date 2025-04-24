package com.example.demo.Entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.LocalDateTime;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@RequiredArgsConstructor
@Entity
@Table(name = "messages")
public class Message {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "sender_id", nullable = false)
    @NonNull
    @NotBlank
    private User sender;

    @ManyToOne
    @JoinColumn(name = "receiver_id", nullable = false)
    @NonNull
    @NotBlank
    private User receiver;

    @NonNull
    @NotBlank
    private String content;

    @NonNull
    @NotBlank
    private LocalDateTime timestamp;
}