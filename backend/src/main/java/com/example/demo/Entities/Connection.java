package com.example.demo.Entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Entity
public class Connection {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private User receiver;

    @ManyToOne
    private UserProfile connectedUser;

    @ManyToOne
    @JoinColumn(name = "user_connections_id") // optional, for DB column naming
    private UserConnections userConnections;

    private LocalDateTime createdAt = LocalDateTime.now();
}
