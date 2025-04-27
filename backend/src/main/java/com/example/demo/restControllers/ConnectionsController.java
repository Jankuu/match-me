package com.example.demo.restControllers;

import com.example.demo.dTOs.UserConnectionDTO;
import com.example.demo.entities.Connection;
import com.example.demo.entities.UserConnections;
import com.example.demo.services.ConnectionsService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/connections")
public class ConnectionsController {
    private final ConnectionsService connectionsService;

    public ConnectionsController(ConnectionsService connectionsService) {
        this.connectionsService = connectionsService;
    }

    // GET
    @GetMapping
    public UserConnections getUserConnections(
            @RequestParam(required = false) Long id,
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String email) {
        return connectionsService.getUserConnections(id, username, email);
    }

    @GetMapping("/connectionRequests")
    public List<Connection> getConnectionRequests(
            @RequestParam(required = false) Long id,
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String email) {
        return connectionsService.getConnectionRequests(id, username, email);
    }

    @GetMapping("/connections")
    public List<Connection> getConnections(
            @RequestParam(required = false) Long id,
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String email) {
        return connectionsService.getConnections(id, username, email);
    }

    // POST
    @PostMapping("/send")
    public Connection sendRequest(@RequestBody UserConnectionDTO connectionDTO) {
        return connectionsService.sendRequest(connectionDTO);
    }

    @PostMapping("/accept")
    public Connection acceptRequest(@RequestBody UserConnectionDTO connectionDTO) {
        return connectionsService.acceptRequest(connectionDTO);
    }

    // DELETE
    @DeleteMapping("/connectionRequest")
    public Connection deleteRequest(@RequestBody UserConnectionDTO connectionDTO) {
        return connectionsService.deleteRequest(connectionDTO);
    }

    @DeleteMapping("/connection")
    public Connection deleteConnection(@RequestBody UserConnectionDTO connectionDTO) {
        return connectionsService.deleteConnection(connectionDTO);
    }
}
