package com.example.demo.restControllers;

import com.example.demo.cTOs.UserDTO;
import com.example.demo.cTOs.UserInterestVectorDTO;
import com.example.demo.cTOs.UserProfileDTO;
import com.example.demo.cTOs.UserRegistrationDTO;
import com.example.demo.entities.User;
import com.example.demo.entities.UserInterestVector;
import com.example.demo.entities.UserProfile;
import com.example.demo.repositories.UserRepository;
import com.example.demo.services.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
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

    @GetMapping("/interestsVector")
    public UserInterestVector getUserInterestsVector(
            @RequestParam(required = false) Long id,
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String email) {
        return userService.getUserInterestsVector(id, username, email);
    }

    // POST
    @PostMapping
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
        return userService.patchUser(id, username, email, userDTO);
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

    @DeleteMapping
    public User deleteUser(
            @RequestParam(required = false) Long id,
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String email) {
        return userService.deleteUser(id, username, email);
    }

    @DeleteMapping("/profile")
    public User deleteUserProfile(
            @RequestParam(required = false) Long id,
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String email) {
        return userService.deleteUserProfile(id, username, email);
    }

    @DeleteMapping("/interestsVector")
    public User deleteUserInterestsVector(
            @RequestParam(required = false) Long id,
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String email
    ) {
        return userService.deleteUserInterestsVector(id, username, email);
    }
}
