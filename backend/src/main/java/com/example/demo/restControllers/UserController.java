package com.example.demo.restControllers;

import com.example.demo.dTOs.UserDTO;
import com.example.demo.dTOs.UserInterestVectorDTO;
import com.example.demo.dTOs.UserProfileDTO;
import com.example.demo.dTOs.UserRegistrationDTO;
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
    public UserDTO getUser(
            @RequestParam(required = false) Long id,
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String email) {
        return userService.getUserDTO(id, username, email);
    }

    @GetMapping("/profilePicture")
    public String getUserProfilePicture(
            @RequestParam(required = false) Long id,
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String email) {
        return userService.getUserProfilePicture(id, username, email);
    }

    @GetMapping("/profile")
    public UserProfileDTO getUserProfile(
            @RequestParam(required = false) Long id,
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String email) {
        return userService.getUserProfileDTO(id, username, email);
    }

    @GetMapping("/interestsVector")
    public UserInterestVectorDTO getUserInterestsVector(
            @RequestParam(required = false) Long id,
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String email) {
        return userService.getUserInterestsVectorDTO(id, username, email);
    }

    // POST
    @PostMapping
    public UserDTO registerUser(
            @Valid @RequestBody UserRegistrationDTO userRegistrationDTO) {
        return userService.registerNewUser(userRegistrationDTO);
    }

    // PATCH
    @PatchMapping
    public UserDTO patchUser(
            @RequestParam(required = false) Long id,
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String email,
            @Valid @RequestBody UserDTO userDTO) {
        return userService.patchUser(id, username, email, userDTO);
    }

    @PatchMapping("/profile")
    public UserProfileDTO patchUserProfile(
            @RequestParam(required = false) Long id,
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String email,
            @Valid @RequestBody UserProfileDTO userProfileDTO) {
        return userService.patchUserProfile(id, username, email, userProfileDTO);
    }

    @PatchMapping("/interestsVector")
    public UserInterestVectorDTO patchUserInterestsVector(
            @RequestParam(required = false) Long id,
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String email,
            @Valid @RequestBody UserInterestVectorDTO userInterestVectorDTO
    ) {
        return userService.patchUserInterestsVector(id, username, email, userInterestVectorDTO);
    }

    // DELETE
    @DeleteMapping
    public UserDTO deleteUser(
            @RequestParam(required = false) Long id,
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String email) {
        return userService.deleteUser(id, username, email);
    }

    @DeleteMapping("/profile")
    public UserDTO deleteUserProfile(
            @RequestParam(required = false) Long id,
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String email) {
        return userService.deleteUserProfile(id, username, email);
    }

    @DeleteMapping("/interestsVector")
    public UserDTO deleteUserInterestsVector(
            @RequestParam(required = false) Long id,
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String email
    ) {
        return userService.deleteUserInterestsVector(id, username, email);
    }
}
