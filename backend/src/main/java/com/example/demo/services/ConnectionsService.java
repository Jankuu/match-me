package com.example.demo.services;

import com.example.demo.dTOs.ConnectionDTO;
import com.example.demo.dTOs.UserProfileDTO;
import com.example.demo.entities.Connection;
import com.example.demo.entities.User;
import com.example.demo.exceptions.ConnectionAlreadyExistsException;
import com.example.demo.exceptions.ResourceNotFoundException;
import com.example.demo.repositories.ConnectionRepository;
import com.example.demo.repositories.UserRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class ConnectionsService {
    private final ConnectionRepository connectionRepository;
    private final UserRepository userRepository;
    private final UserService userService;
    private final SimpMessagingTemplate messagingTemplate;

    public ConnectionsService(ConnectionRepository connectionRepository, UserRepository userRepository, UserService userService, SimpMessagingTemplate messagingTemplate) {
        this.connectionRepository = connectionRepository;
        this.userRepository = userRepository;
        this.userService = userService;
        this.messagingTemplate = messagingTemplate;
    }

    // GET
    public Map<String, List<ConnectionDTO>> getUserConnections(String username) {
        Map<String, List<ConnectionDTO>> userConnections = new HashMap<>();
        userConnections.put("Connections", getConnections(username));
        userConnections.put("ConnectionRequests", getConnectionRequests(username));
        return userConnections;
    }

    public List<ConnectionDTO> getConnectionRequests(String username) {
        User user = userService.getUserByUsername(username);
        return user.getConnectionRequests()
                .stream()
                .sorted(Comparator.comparing(Connection::getCreatedAt).reversed())
                .map(ConnectionDTO::new)
                .toList();
    }

    public List<ConnectionDTO> getConnections(String username) {
        User user = userService.getUserByUsername(username);
        return user.getConnections()
                .stream()
                .sorted(Comparator.comparing(Connection::getCreatedAt).reversed())
                .map(ConnectionDTO::new)
                .toList();
    }

    public List<User> getRejected(String username) {
        User user = userService.getUserByUsername(username);
        return user.getRejectedUsers();
    }

    // POST
    public ConnectionDTO sendRequest(String senderUsername, Long receiverProfileId) {
        User sender = userService.getUserByUsername(senderUsername);
        User receiver = userService.getUserByProfileId(receiverProfileId);

        Optional<Connection> existing = connectionRepository.findConnectionByReceiverAndSender(receiver.getProfile(), sender.getProfile());
        if (existing.isPresent()) {
            throw new ConnectionAlreadyExistsException("Connection between users already exists.", existing);
        }

        Connection request = new Connection();
        request.setSender(sender.getProfile());
        request.setReceiver(receiver.getProfile());
        connectionRepository.save(request);

        receiver.getConnectionRequests().add(request);
        userRepository.save(receiver);

        ConnectionDTO connectionDTO = new ConnectionDTO(request);

        // Notify receiver
        messagingTemplate.convertAndSendToUser(
                receiverProfileId.toString(),
                "/queue/notifications/connectionRequest",
                sender.getProfile()
        );

        return connectionDTO;
    }

    public ConnectionDTO acceptRequest(String receiverUsername, Long senderProfileId) {
        User receiver = userService.getUserByUsername(receiverUsername);
        User sender = userService.getUserByProfileId(senderProfileId);

        Connection request = connectionRepository.findConnectionByReceiverAndSender(receiver.getProfile(), sender.getProfile()).orElseThrow(() -> new ResourceNotFoundException("Could not find connection between users", null));

        if (receiver.getConnections().contains(request)) {
            throw new ConnectionAlreadyExistsException("Connection between users already exists.", request);
        }

        receiver.getConnectionRequests().remove(request);
        receiver.getConnections().add(request);
        sender.getConnections().add(request);
        connectionRepository.save(request);

        // Notify receiver and sender
        messagingTemplate.convertAndSendToUser(
                senderProfileId.toString(),
                "/queue/notifications/connection",
                receiver.getProfile()
        );
        messagingTemplate.convertAndSendToUser(
                receiver.getProfile().getId().toString(),
                "/queue/notifications/connection",
                sender.getProfile()
        );

        return new ConnectionDTO(request);
    }

    public ConnectionDTO rejectRequest(String receiverUsername, Long senderProfileId) {
        User receiver = userService.getUserByUsername(receiverUsername);
        User sender = userService.getUserByProfileId(senderProfileId);

        receiver.getRejectedUsers().add(sender);
        sender.getRejectedUsers().add(receiver);

        userRepository.save(receiver);
        userRepository.save(sender);

        Connection request = connectionRepository.findConnectionByReceiverAndSender(receiver.getProfile(), sender.getProfile()).orElse(null);
        if (request != null) {
            receiver.getConnectionRequests().remove(request);
            connectionRepository.delete(request);
            return new ConnectionDTO(request);
        }
        return new ConnectionDTO(null, new UserProfileDTO(receiver.getProfile()), new UserProfileDTO(sender.getProfile()), null);
    }

    // DELETE
    public void deleteConnection(Connection connection) {
        User sender = userRepository.findByProfile(connection.getSender()).orElseThrow(() -> new ResourceNotFoundException("Could not find sender in connection", connection));
        User receiver = userRepository.findByProfile(connection.getReceiver()).orElseThrow(() -> new ResourceNotFoundException("Could not find receiver in connection", connection));

        sender.getConnections().remove(connection);
        receiver.getConnections().remove(connection);

        sender.getConnectionRequests().remove(connection);
        receiver.getConnectionRequests().remove(connection);

        connectionRepository.delete(connection);
        new ConnectionDTO(connection);
    }
}
