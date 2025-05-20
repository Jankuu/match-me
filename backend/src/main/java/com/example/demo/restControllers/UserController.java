package com.example.demo.restControllers;

import com.example.demo.dTOs.*;
import com.example.demo.entities.User;
import com.example.demo.entities.UserProfile;
import com.example.demo.services.UserService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // GET
    @GetMapping("/all")
    public Page<User> getUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return userService.getUsers(PageRequest.of(page, size));
    }

    @GetMapping
    public UserDTO getUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();
        return userService.getUserDTO(currentUsername);
    }

    @GetMapping("/profilePicture")
    public String getUserProfilePicture() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();
        return userService.getUserProfilePicture(currentUsername);
    }

    @GetMapping("/profile")
    public UserProfileDTO getUserProfile() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();
        return userService.getUserProfileDTO(currentUsername);
    }

    @GetMapping("/interestsVector")
    public UserInterestVectorDTO getUserInterestsVector() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();
        return userService.getUserInterestsVectorDTO(currentUsername);
    }

    @GetMapping("/userMatches")
    public UserMatchesDTO getUserMatches() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();
        return userService.getUserMatches(currentUsername);
    }

    @GetMapping("/recommendation")
    public List<UserProfile> getRecommendations() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();
        return userService.getFilteredRecommendations(currentUsername);
    }

    // POST
    @PostMapping("/register")
    public UserDTO registerUser(
            @Valid @RequestBody UserRegistrationDTO userRegistrationDTO) {
        return userService.registerNewUser(userRegistrationDTO);
    }

    // PATCH
    @PatchMapping
    public UserDTO patchUser(@Valid @RequestBody UserDTO userDTO) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();
        return userService.patchUser(currentUsername, userDTO);
    }

    @PatchMapping("/profile")
    public UserProfileDTO patchUserProfile(@Valid @RequestBody UserProfileDTO userProfileDTO) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();
        return userService.patchUserProfile(currentUsername, userProfileDTO);
    }

    // DELETE
    @DeleteMapping
    public UserDTO deleteUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();
        return userService.deleteUser(currentUsername);
    }

    //testing jwt
    /*
    @GetMapping("/me")
    public UserDTO getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();
        return userService.getUserDTO(currentUsername);
    }

    @GetMapping("/me/interestsVector")
    public UserInterestVectorDTO getCurrentUserInterestsVector() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();
        return userService.getUserInterestsVectorDTO(null, currentUsername, null);
    }

    @GetMapping("/me/profilePicture")
    public String getCurrentUserProfilePicture() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();
        return userService.getUserProfilePicture(null, currentUsername, null);
    }

    @GetMapping("/me/profile")
    public UserProfileDTO getCurrentUserProfile() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();
        return userService.getUserProfileDTO(null, currentUsername, null);
    }*/
}
