package com.example.demo.services;

import com.example.demo.dTOs.ConnectionDTO;
import com.example.demo.dTOs.UserLinkDTO;
import com.example.demo.entities.Connection;
import com.example.demo.entities.User;
import com.example.demo.exceptions.ConnectionAlreadyExistsException;
import com.example.demo.exceptions.ResourceNotFoundException;
import com.example.demo.repositories.ConnectionRepository;
import com.example.demo.repositories.UserRepository;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class ConnectionsService {
    private final ConnectionRepository connectionRepository;
    private final UserRepository userRepository;
    private final UserService userService;
    private final SimpMessagingTemplate messagingTemplate;

    public ConnectionsService(ConnectionRepository connectionRepository1, UserRepository userRepository, UserService userService, SimpMessagingTemplate messagingTemplate) {
        this.connectionRepository = connectionRepository1;
        this.userRepository = userRepository;
        this.userService = userService;
        this.messagingTemplate = messagingTemplate;
    }

    // GET
    public Map<String, List<ConnectionDTO>> getUserConnections(Long id, String username, String email) {
        Map<String, List<ConnectionDTO>> userConnections = new HashMap<>();
        userConnections.put("Connections", getConnections(id, username, email));
        userConnections.put("ConnectionRequests", getConnectionRequests(id, username, email));
        return userConnections;
    }

    public List<ConnectionDTO> getConnectionRequests(Long id, String username, String email) {
        User user = userService.getUser(id, username, email);
        return user.getConnectionRequests()
                .stream()
                .sorted(Comparator.comparing(Connection::getCreatedAt).reversed())
                .map(ConnectionDTO::new)
                .toList();
    }

    public List<ConnectionDTO> getConnections(Long id, String username, String email) {
        User user = userService.getUser(id, username, email);
        return user.getConnections()
                .stream()
                .sorted(Comparator.comparing(Connection::getCreatedAt).reversed())
                .map(ConnectionDTO::new)
                .toList();
    }

    private FullConnection getFullConnection(UserLinkDTO connectionDTO) {
        User sender = userService.getUser(connectionDTO.getSenderId(), connectionDTO.getSenderUsername(), connectionDTO.getSenderEmail());
        User receiver = userService.getUser(connectionDTO.getReceiverId(), connectionDTO.getReceiverUsername(), connectionDTO.getReceiverEmail());
        Connection connection = connectionRepository.findConnectionByReceiverAndSender(receiver.getProfile(), sender.getProfile()).orElseThrow(() -> new ResourceNotFoundException("Could not find the connection between users", connectionDTO));
        return new FullConnection(sender, receiver, connection);
    }

    // POST
    public ConnectionDTO sendRequest(UserLinkDTO userLinkDTO) {
        User sender = userService.getUser(userLinkDTO.getSenderId(), userLinkDTO.getSenderUsername(), userLinkDTO.getSenderEmail());
        User receiver = userService.getUser(userLinkDTO.getReceiverId(), userLinkDTO.getSenderUsername(), userLinkDTO.getReceiverEmail());

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
                receiver.getUsername(),
                "/queue/notifications/connectionRequest",
                sender.getProfile()
        );

        return connectionDTO;
    }

    public ConnectionDTO acceptRequest(UserLinkDTO connectionDTO) {
        FullConnection fullConnection = getFullConnection(connectionDTO);
        User sender = fullConnection.sender;
        User receiver = fullConnection.receiver;
        Connection request = fullConnection.connection;

        if (receiver.getConnections().contains(request)) {
            throw new ConnectionAlreadyExistsException("Connection between users already exists.", request);
        }

        receiver.getConnectionRequests().remove(request);
        receiver.getConnections().add(request);
        sender.getConnections().add(request);
        connectionRepository.save(request);

        // Notify receiver and sender
        messagingTemplate.convertAndSendToUser(
                sender.getUsername(),
                "/queue/notifications/connection",
                receiver.getProfile()
        );
        messagingTemplate.convertAndSendToUser(
                receiver.getUsername(),
                "/queue/notifications/connection",
                sender.getProfile()
        );

        return new ConnectionDTO(request);
    }

    // DELETE
    public ConnectionDTO deleteConnection(UserLinkDTO connectionDTO) {
        Connection connection = getFullConnection(connectionDTO).connection;
        return deleteConnection(connection);
    }

    public ConnectionDTO deleteConnection(Connection connection) {
        User sender = userRepository.findByProfile(connection.getSender()).orElseThrow(() -> new ResourceNotFoundException("Could not find sender in connection", connection));
        User receiver = userRepository.findByProfile(connection.getReceiver()).orElseThrow(() -> new ResourceNotFoundException("Could not find receiver in connection", connection));

        sender.getConnections().remove(connection);
        receiver.getConnections().remove(connection);

        sender.getConnectionRequests().remove(connection);
        receiver.getConnectionRequests().remove(connection);

        connectionRepository.delete(connection);
        return new ConnectionDTO(connection);
    }

    // HELPER METHODS
    @Setter
    @Getter
    @AllArgsConstructor
    public static class FullConnection {
        private User sender;
        private User receiver;
        private Connection connection;
    }
}
