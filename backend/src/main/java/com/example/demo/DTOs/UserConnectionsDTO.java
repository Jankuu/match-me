package com.example.demo.DTOs;

import com.example.demo.Constraints.EmailOrUsername;
import com.example.demo.Entities.Connection;
import com.example.demo.Entities.ConnectionRequest;
import com.example.demo.Entities.UserConnections;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.stream.Collectors;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@EmailOrUsername
public class UserConnectionsDTO {
    private List<Connection> connections;
    private List<ConnectionRequest> pendingRequests;

    public UserConnectionsDTO(UserConnections connections) {
        this.connections = connections.getConnections();
        this.pendingRequests = connections.getPendingRequests();
    }
}