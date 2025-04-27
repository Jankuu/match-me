package com.example.demo.services;

import com.example.demo.dTOs.UserConnectionDTO;
import com.example.demo.entities.Connection;
import com.example.demo.entities.User;
import com.example.demo.entities.UserConnections;
import com.example.demo.entities.UserProfile;
import com.example.demo.exceptions.ResourceNotFoundException;
import com.example.demo.repositories.ConnectionRepository;
import com.example.demo.repositories.UserConnectionsRepository;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;

@Service
public class ConnectionsService {
    private final UserConnectionsRepository userConnectionRepository;
    private final ConnectionRepository connectionRepository;
    private final UserService userService;

    public ConnectionsService(UserConnectionsRepository connectionRepository, ConnectionRepository connectionRepository1, UserService userService) {
        this.userConnectionRepository = connectionRepository;
        this.connectionRepository = connectionRepository1;
        this.userService = userService;
    }

    // GET
    public UserConnections getUserConnections(Long id, String username, String email) {
        User user = userService.getUser(id, username, email);
        return user.getUserConnections();
    }

    public List<Connection> getConnectionRequests(Long id, String username, String email) {
        User user = userService.getUser(id, username, email);
        return user.getUserConnections().getConnectionRequests();
    }

    public List<Connection> getConnections(Long id, String username, String email) {
        User user = userService.getUser(id, username, email);
        return user.getUserConnections().getConnections();
    }

    // POST
    public Connection sendRequest(UserConnectionDTO connectionDTO) {
        User sender = userService.getUser(connectionDTO.getSenderID(), connectionDTO.getSenderUsername(), connectionDTO.getSenderEmail());
        User receiver = userService.getUser(connectionDTO.getReceiverID(), connectionDTO.getSenderUsername(), connectionDTO.getReceiverEmail());

        if (receiver.getUserConnections() == null) {
            receiver.setUserConnections(new UserConnections());
        }

        UserConnections receiverConnections = receiver.getUserConnections();
        List<Connection> receiverPendingRequests = receiverConnections.getConnectionRequests();
        Connection newRequest = new Connection();

        newRequest.setReceiver(receiver.getProfile());
        newRequest.setSender(sender.getProfile());
        //newRequest = connectionRepository.save(newRequest);

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

        Connection currentRequest = getConnectionRequest(receiver.getProfile(), sender.getProfile());
        receiver.getUserConnections().getConnectionRequests().remove(currentRequest);

        Connection newConnection = new Connection();
        newConnection.setReceiver(receiver.getProfile());
        newConnection.setSender(sender.getProfile());
        //newConnection = connectionRepository.save(newConnection);

        receiver.getUserConnections().getConnections().add(newConnection);
        sender.getUserConnections().getConnections().add(newConnection);
        userConnectionRepository.save(receiver.getUserConnections());

        return newConnection;
    }

    // DELETE
    public Connection deleteRequest(UserConnectionDTO connectionDTO) {
        return null;
    }

    public Connection deleteConnection(UserConnectionDTO connectionDTO) {
        return null;
    }

    // HELPER METHODS
    private Connection getConnectionRequest(UserProfile receiver, UserProfile sender) {
        List<UserProfile> output = Arrays.asList(receiver, sender);
        return connectionRepository.findRequestByReceiverAndSender(receiver, sender).orElseThrow(() -> new ResourceNotFoundException("Could not find a connection request", output));
    }
}
