package com.example.demo.services;

import com.example.demo.dTOs.ConnectionDTO;
import com.example.demo.dTOs.UserProfileDTO;
import com.example.demo.entities.Connection;
import com.example.demo.entities.User;
import com.example.demo.entities.UserProfile;
import com.example.demo.exceptions.ConnectionAlreadyExistsException;
import com.example.demo.exceptions.ResourceNotFoundException;
import com.example.demo.repositories.ConnectionRepository;
import com.example.demo.repositories.UserRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
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
                .sorted(Comparator.comparing(Connection::getLastActivity).reversed())
                .map(ConnectionDTO::new)
                .toList();
    }

    public List<ConnectionDTO> getConnections(String username) {
        User user = userService.getUserByUsername(username);
        return user.getConnections()
                .stream()
                .sorted(Comparator.comparing(Connection::getLastActivity).reversed())
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
        request.setLastActivity(LocalDateTime.now());
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
        System.out.println("New connection request from " + senderUsername);

        return connectionDTO;
    }

    public ConnectionDTO acceptRequest(String receiverUsername, Long senderProfileId) {
        User receiver = userService.getUserByUsername(receiverUsername);
        User sender = userService.getUserByProfileId(senderProfileId);

        Connection request = connectionRepository.findConnectionByReceiverAndSender(receiver.getProfile(), sender.getProfile()).orElseThrow(() -> new ResourceNotFoundException("Could not find connection between users", null));

        if (receiver.getConnections().contains(request)) {
            throw new ConnectionAlreadyExistsException("Connection between users already exists.", request);
        }

        request.setLastActivity(LocalDateTime.now());
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

    public ConnectionDTO rejectRequest(String currentUsername, Long otherProfileId) {
        User currentUser = userService.getUserByUsername(currentUsername);
        User otherUser = userService.getUserByProfileId(otherProfileId);

        currentUser.getRejectedUsers().add(otherUser);
        otherUser.getRejectedUsers().add(currentUser);

        userRepository.save(currentUser);
        userRepository.save(otherUser);

        Connection connection = connectionRepository.findConnectionBetweenUsers(currentUser.getProfile(), otherUser.getProfile()).orElse(null);

        if (connection != null) {
            if (currentUser.getConnections().contains(connection)) {
                messagingTemplate.convertAndSendToUser(
                        currentUser.getProfile().getId().toString(),
                        "/queue/notifications/disconnect",
                        otherUser.getProfile().getId().toString()
                );
                messagingTemplate.convertAndSendToUser(
                        otherUser.getProfile().getId().toString(),
                        "/queue/notifications/disconnect",
                        currentUser.getProfile().getId().toString()
                );
            }
            currentUser.getConnectionRequests().remove(connection);
            otherUser.getConnectionRequests().remove(connection);
            currentUser.getConnections().remove(connection);
            otherUser.getConnections().remove(connection);
            connectionRepository.delete(connection);
            return new ConnectionDTO(connection);
        }
        return new ConnectionDTO(null, new UserProfileDTO(currentUser.getProfile()), new UserProfileDTO(otherUser.getProfile()), null);
    }

    public void updateConnectionActivityTime(Long profileId1, Long profileId2) {
        UserProfile userProfile1 = userService.getUserByProfileId(profileId1).getProfile();
        UserProfile userProfile2 = userService.getUserByProfileId(profileId2).getProfile();

        Connection connection = connectionRepository.findConnectionBetweenUsers(userProfile1, userProfile2).orElseThrow(() -> new ResourceNotFoundException("Could not find connection between userProfiles", userProfile1 + " AND " + userProfile2));

        connection.setLastActivity(LocalDateTime.now());
        connectionRepository.save(connection);
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
