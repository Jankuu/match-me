package com.example.demo.RestControllers;

import com.example.demo.DTOs.UserDTO;
import com.example.demo.DTOs.UserInterestVectorDTO;
import com.example.demo.DTOs.UserProfileDTO;
import com.example.demo.DTOs.UserRegistrationDTO;
import com.example.demo.Entities.User;
import com.example.demo.Entities.UserConnections;
import com.example.demo.Entities.UserInterestVector;
import com.example.demo.Entities.UserProfile;
import com.example.demo.Repositories.UserRepository;
import com.example.demo.Services.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/users")
public class UserController {
    private final UserService userService;
    private final UserConnectionsService connectionsService;

    public UserController(UserService userService, UserConnectionsService connectionsService) {
        this.userService = userService;
        this.connectionsService = connectionsService;
    }

    @Autowired
    private UserRepository userRepository;

    // GET
    @GetMapping("/all")
    public Page<User> getUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return userService.getUsers(PageRequest.of(page, size));
    }

    @GetMapping
    public User getUser(
            @RequestParam(required = false) Long id,
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String email) {
        return userService.getUser(id, username, email);
    }

    @GetMapping("/profile")
    public UserProfile getUserProfile(
            @RequestParam(required = false) Long id,
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String email) {
        return userService.getUserProfile(id, username, email);
    }

    @GetMapping("/connections")
    public ResponseEntity<Map<String, Page<UserProfileDTO>>> getUserConnections(
            @RequestParam(required = false) Long id,
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String email,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        User user = userService.getUser(id, username, email);
        UserConnections connections = user.getConnections();

        Page<UserProfileDTO> confirmed = connectionsService.getConnections(connections, pageable);
        Page<UserProfileDTO> pending = connectionsService.getPendingRequests(connections, pageable);

        Map<String, Page<UserProfileDTO>> result = new HashMap<>();
        result.put("connections", confirmed);
        result.put("pendingRequests", pending);

        return ResponseEntity.ok(result);
    }

    @GetMapping("/interestsVector")
    public UserInterestVector getUserInterestsVector(
            @RequestParam(required = false) Long id,
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String email) {
        return userService.getUserInterestsVector(id, username, email);
    }

    // POST
    @PostMapping("/register")
    public User registerUser(
            @Valid @RequestBody UserRegistrationDTO userRegistrationDTO) {
        return userService.registerNewUser(userRegistrationDTO);
    }

    // PATCH
    @PatchMapping
    public User patchUser(
            @RequestParam(required = false) Long id,
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String email,
            @Valid @RequestBody UserDTO userDTO) {
        return userService.patchUser(id, username, email,userDTO);
    }

    @PatchMapping("/profile")
    public UserProfile patchUserProfile(
            @RequestParam(required = false) Long id,
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String email,
            @Valid @RequestBody UserProfileDTO userProfileDTO) {
        return userService.patchUserProfile(id, username, email, userProfileDTO);
    }

    @PatchMapping("/interestsVector")
    public UserInterestVector patchUserInterestsVector(
            @RequestParam(required = false) Long id,
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String email,
            @Valid @RequestBody UserInterestVectorDTO userInterestVectorDTO
    ) {
        return userService.patchUserInterestsVector(id, username, email, userInterestVectorDTO);
    }

    // DELETE

    @DeleteMapping("/delete")
    public User deleteUser(
            @RequestParam(required = false) Long id,
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String email) {
        User user = userService.getUser(id, username, email);
        userRepository.deleteById(user.getId());
        return user;
    }
}
