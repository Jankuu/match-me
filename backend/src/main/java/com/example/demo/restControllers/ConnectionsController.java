package com.example.demo.restControllers;

import com.example.demo.dTOs.ConnectionDTO;
import com.example.demo.dTOs.UserLinkDTO;
import com.example.demo.entities.User;
import com.example.demo.services.ConnectionsService;
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
    public Map<String, List<ConnectionDTO>> getUserConnections(
            @RequestParam(required = false) Long id,
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String email){
        return connectionsService.getUserConnections(id, username,email);
    }

    @GetMapping("/connectionRequests")
    public List<ConnectionDTO> getConnectionRequests(
            @RequestParam(required = false) Long id,
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String email) {
        return connectionsService.getConnectionRequests(id, username, email);
    }

    @GetMapping("/connections")
    public List<ConnectionDTO> getConnections(
            @RequestParam(required = false) Long id,
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String email) {
        return connectionsService.getConnections(id, username, email);
    }

    @GetMapping("/rejected")
    public List<User> getRejected (@RequestParam Long id){
        return connectionsService.getRejected(id);
    }

    // POST
    @PostMapping("/send")
    public ConnectionDTO sendRequest(@RequestBody UserLinkDTO userLinkDTO) {
        return connectionsService.sendRequest(userLinkDTO);
    }

    @PostMapping("/accept")
    public ConnectionDTO acceptRequest(@RequestBody UserLinkDTO userLinkDTO) {
        return connectionsService.acceptRequest(userLinkDTO);
    }

    @PostMapping("/reject")
    public ConnectionDTO rejectRequest(@RequestBody UserLinkDTO userLinkDTO) {
        return connectionsService.rejectRequest(userLinkDTO);
    }

    // DELETE
    @DeleteMapping("/connection")
    public ConnectionDTO deleteConnection(@RequestBody UserLinkDTO userLinkDTO) {
        return connectionsService.deleteConnection(userLinkDTO);
    }
}
