package com.example.demo.services;

import com.example.demo.dTOs.UserConnectionDTO;
import com.example.demo.entities.Connection;
import com.example.demo.entities.User;
import com.example.demo.exceptions.ResourceNotFoundException;
import com.example.demo.repositories.ConnectionRepository;
import com.example.demo.repositories.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ConnectionsService {
    private final ConnectionRepository connectionRepository;
    private final UserRepository userRepository;
    private final UserService userService;

    public ConnectionsService(ConnectionRepository connectionRepository1, UserRepository userRepository, UserService userService) {
        this.connectionRepository = connectionRepository1;
        this.userRepository = userRepository;
        this.userService = userService;
    }

    // GET
    public Connection getConnection(UserConnectionDTO connectionDTO) {
        User sender = userService.getUser(connectionDTO.getSenderID(), connectionDTO.getSenderUsername(), connectionDTO.getSenderEmail());
        User receiver = userService.getUser(connectionDTO.getReceiverID(), connectionDTO.getSenderUsername(), connectionDTO.getReceiverEmail());

        return connectionRepository.findConnectionByReceiverAndSender(receiver.getProfile(), sender.getProfile()).orElseThrow(() -> new ResourceNotFoundException("Could not find the connection between users", connectionDTO));
    }

    public List<Connection> getConnectionRequests(Long id, String username, String email) {
        User user = userService.getUser(id, username, email);
        return user.getConnectionRequests();
    }

    public List<Connection> getConnections(Long id, String username, String email) {
        User user = userService.getUser(id, username, email);
        return user.getConnections();
    }

    // POST
    public Connection sendRequest(UserConnectionDTO connectionDTO) {
        User sender = userService.getUser(connectionDTO.getSenderID(), connectionDTO.getSenderUsername(), connectionDTO.getSenderEmail());
        User receiver = userService.getUser(connectionDTO.getReceiverID(), connectionDTO.getSenderUsername(), connectionDTO.getReceiverEmail());

        Connection request = new Connection();
        request.setSender(sender.getProfile());
        request.setReceiver(receiver.getProfile());
        connectionRepository.save(request);

        receiver.getConnectionRequests().add(request);
        userRepository.save(receiver);
        return request;
    }

    public Connection acceptRequest(UserConnectionDTO connectionDTO) {
        User sender = userService.getUser(connectionDTO.getSenderID(), connectionDTO.getSenderUsername(), connectionDTO.getSenderEmail());
        User receiver = userService.getUser(connectionDTO.getReceiverID(), connectionDTO.getSenderUsername(), connectionDTO.getReceiverEmail());

        Connection request = connectionRepository.findConnectionByReceiverAndSender(receiver.getProfile(), sender.getProfile()).orElseThrow(() -> new ResourceNotFoundException("Could not find the connection between users", connectionDTO));

        receiver.getConnectionRequests().remove(request);
        receiver.getConnections().add(request);
        sender.getConnections().add(request);

        return connectionRepository.save(request);
    }

    // DELETE
    public Connection deleteConnection(UserConnectionDTO connectionDTO) {
        Connection connection = getConnection(connectionDTO);
        return deleteConnection(connection);
    }

    public Connection deleteConnection(Connection connection) {
        User sender = userRepository.findByProfile(connection.getSender()).orElseThrow(() -> new ResourceNotFoundException("Could not find sender in connection", connection));
        User receiver = userRepository.findByProfile(connection.getReceiver()).orElseThrow(() -> new ResourceNotFoundException("Could not find receiver in connection", connection));

        sender.getConnections().remove(connection);
        receiver.getConnections().remove(connection);

        sender.getConnectionRequests().remove(connection);
        receiver.getConnectionRequests().remove(connection);

        connectionRepository.delete(connection);
        return connection;
    }
    // HELPER METHODS
}
