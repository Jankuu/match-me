package com.example.demo.restControllers;

import com.example.demo.dTOs.*;
import com.example.demo.entities.User;
import com.example.demo.services.UserService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

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

    @GetMapping("/userMatches")
    public UserMatchesDTO getUserMatches(@RequestParam long id){
        return userService.getUserMatches(id);
    }

    // POST
    @PostMapping
    public UserDTO registerUser(
            @Valid @RequestBody UserRegistrationDTO userRegistrationDTO) {
        return userService.registerNewUser(userRegistrationDTO);
    }

    // PATCH
    /*
    INOP: Does not use List<Game> to calc interest vector

    @PatchMapping
    public UserDTO patchUser(
            @RequestParam(required = false) Long id,
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String email,
            @Valid @RequestBody UserDTO userDTO) {
        return userService.patchUser(id, username, email, userDTO);
    }
*/
    @PatchMapping("/profile")
    public UserProfileDTO patchUserProfile(
            @RequestParam(required = false) Long id,
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String email,
            @Valid @RequestBody UserProfileDTO userProfileDTO) {
        return userService.patchUserProfile(id, username, email, userProfileDTO);
    }

    /*
    INOP: Does not use List<Game> to calc interest vector

    @PatchMapping("/interestsVector")
    public UserInterestVectorDTO patchUserInterestsVector(
            @RequestParam(required = false) Long id,
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String email,
            @Valid @RequestBody UserInterestVectorDTO userInterestVectorDTO
    ) {
        return userService.patchUserInterestsVector(id, username, email, userInterestVectorDTO);
    }
*/
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

    //testing jwt

    @GetMapping("/me")
    public UserDTO getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();
        return userService.getUserDTO(null, currentUsername, null);
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
    }
}
