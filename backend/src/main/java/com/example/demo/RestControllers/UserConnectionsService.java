package com.example.demo.RestControllers;

import com.example.demo.DTOs.UserProfileDTO;
import com.example.demo.Entities.UserConnections;
import com.example.demo.Repositories.ConnectionRepository;
import com.example.demo.Repositories.ConnectionRequestRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class UserConnectionsService {

    private final ConnectionRepository connectionRepo;
    private final ConnectionRequestRepository requestRepo;

    public UserConnectionsService(ConnectionRepository connectionRepo, ConnectionRequestRepository requestRepo) {
        this.connectionRepo = connectionRepo;
        this.requestRepo = requestRepo;
    }

    public Page<UserProfileDTO> getConnections(UserConnections connections, Pageable pageable) {
        return connectionRepo.findByUserConnectionsOrderByCreatedAtDesc(connections, pageable)
                .map(c -> new UserProfileDTO(c.getConnectedUser()));
    }

    public Page<UserProfileDTO> getPendingRequests(UserConnections connections, Pageable pageable) {
        return requestRepo.findByUserConnectionsOrderByCreatedAtDesc(connections, pageable)
                .map(r -> new UserProfileDTO(r.getSender()));
    }
}
