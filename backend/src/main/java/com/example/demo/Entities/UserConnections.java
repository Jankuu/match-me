package com.example.demo.Entities;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "userConnections")
public class UserConnections {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    private User user;

    @OneToMany(mappedBy = "userConnections", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Connection> connections = new ArrayList<>();

    @OneToMany(mappedBy = "userConnections", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ConnectionRequest> pendingRequests = new ArrayList<>();
}