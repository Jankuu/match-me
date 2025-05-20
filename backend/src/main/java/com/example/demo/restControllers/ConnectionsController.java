package com.example.demo.restControllers;

import com.example.demo.dTOs.ConnectionDTO;
import com.example.demo.entities.User;
import com.example.demo.services.ConnectionsService;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/connections")
public class ConnectionsController {
    private final ConnectionsService connectionsService;

    public ConnectionsController(ConnectionsService connectionsService) {
        this.connectionsService = connectionsService;
    }

    // GET
    @GetMapping("/userConnections")
    public Map<String, List<ConnectionDTO>> getUserConnections() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();
        return connectionsService.getUserConnections(currentUsername);
    }

    @GetMapping("/connectionRequests")
    public List<ConnectionDTO> getConnectionRequests() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();
        return connectionsService.getConnectionRequests(currentUsername);
    }

    @GetMapping("/connections")
    public List<ConnectionDTO> getConnections() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();
        return connectionsService.getConnections(currentUsername);
    }

    // Not needed for production, dev only
    @GetMapping("/rejected")
    public List<User> getRejected() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();
        return connectionsService.getRejected(currentUsername);
    }

    // POST
    @PostMapping("/send")
    public ConnectionDTO sendRequest(@RequestParam Long receiverProfileId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();
        return connectionsService.sendRequest(currentUsername, receiverProfileId);
    }

    @PostMapping("/accept")
    public ConnectionDTO acceptRequest(@RequestParam Long senderProfileId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();
        return connectionsService.acceptRequest(currentUsername, senderProfileId);
    }

    @PostMapping("/reject")
    public ConnectionDTO rejectRequest(@RequestParam Long senderProfileId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();
        return connectionsService.rejectRequest(currentUsername, senderProfileId);
    }
}
