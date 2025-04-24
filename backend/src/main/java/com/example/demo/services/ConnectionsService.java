package com.example.demo.services;

import com.example.demo.cTOs.UserConnectionDTO;
import com.example.demo.entities.*;
import com.example.demo.exceptions.ResourceNotFoundException;
import com.example.demo.repositories.ConnectionRepository;
import com.example.demo.repositories.ConnectionRequestRepository;
import com.example.demo.repositories.UserConnectionsRepository;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;

@Service
public class ConnectionsService {
    private final UserConnectionsRepository userConnectionRepository;
    private final ConnectionRequestRepository connectionRequestRepository;
    private final ConnectionRepository connectionRepository;
    private final UserService userService;

    public ConnectionsService(UserConnectionsRepository connectionRepository, ConnectionRequestRepository connectionRequestRepository, ConnectionRepository connectionRepository1, UserService userService) {
        this.userConnectionRepository = connectionRepository;
        this.connectionRequestRepository = connectionRequestRepository;
        this.connectionRepository = connectionRepository1;
        this.userService = userService;
    }

    // GET
    public UserConnections getUserConnections(Long id, String username, String email) {
        return null;
    }

    public List<ConnectionRequest> getConnectionRequests(Long id, String username, String email) {
        return null;
    }

    public List<Connection> getConnections(Long id, String username, String email) {
        return null;
    }

    // POST
    public ConnectionRequest sendRequest(UserConnectionDTO connectionDTO) {
        User sender = userService.getUser(connectionDTO.getSenderID(), connectionDTO.getSenderUsername(), connectionDTO.getSenderEmail());
        User receiver = userService.getUser(connectionDTO.getReceiverID(), connectionDTO.getSenderUsername(), connectionDTO.getReceiverEmail());

        if (receiver.getUserConnections() == null) {
            receiver.setUserConnections(new UserConnections());
        }

        UserConnections receiverConnections = receiver.getUserConnections();
        List<ConnectionRequest> receiverPendingRequests = receiverConnections.getConnectionRequests();
        ConnectionRequest newRequest = new ConnectionRequest();

        newRequest.setReceiver(receiver.getProfile());
        newRequest.setSender(sender.getProfile());

        receiverPendingRequests.add(newRequest);
        receiverConnections.setConnectionRequests(receiverPendingRequests);
        receiver.setUserConnections(receiverConnections);

        userConnectionRepository.save(receiverConnections);
        return newRequest;
    }

    public Connection acceptRequest(UserConnectionDTO connectionDTO) {
        User sender = userService.getUser(connectionDTO.getSenderID(), connectionDTO.getSenderUsername(), connectionDTO.getSenderEmail());
        User receiver = userService.getUser(connectionDTO.getReceiverID(), connectionDTO.getSenderUsername(), connectionDTO.getReceiverEmail());

        if (sender.getUserConnections() == null) {
            sender.setUserConnections(new UserConnections());
        }
        ConnectionRequest currentRequest = getConnectionRequest(receiver.getProfile(), sender.getProfile());
        receiver.getUserConnections().getConnectionRequests().remove(currentRequest);

        Connection newConnection = new Connection();
        newConnection.setReceiver(receiver.getProfile());
        newConnection.setSender(sender.getProfile());

        receiver.getUserConnections().getConnections().add(newConnection);
        sender.getUserConnections().getConnections().add(newConnection);
        userConnectionRepository.save(receiver.getUserConnections());

        return newConnection;
    }

    // DELETE
    public ConnectionRequest deleteRequest(UserConnectionDTO connectionDTO) {
        return null;
    }

    public Connection deleteConnection(UserConnectionDTO connectionDTO) {
        return null;
    }

    // HELPER METHODS
    private ConnectionRequest getConnectionRequest(UserProfile receiver, UserProfile sender) {
        List<UserProfile> output = Arrays.asList(receiver, sender);
        return connectionRequestRepository.findByReceiverAndSender(receiver, sender).orElseThrow(() -> new ResourceNotFoundException("Could not find a connection request", output));
    }
}
