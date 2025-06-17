package com.example.demo.restControllers;

import com.example.demo.dTOs.UserProfileDTO;
import com.example.demo.entities.Connection;
import com.example.demo.entities.Game;
import com.example.demo.entities.User;
import com.example.demo.entities.UserProfile;
import com.example.demo.services.ConnectionsService;
import com.example.demo.services.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.Base64;
import java.util.List;
import java.util.stream.Stream;

@RestController
@RequestMapping("/req")
public class RequirementsController {
    private final ConnectionsService connectionsService;
    private final UserService userService;

    public RequirementsController(ConnectionsService connectionsService, UserService userService) {
        this.connectionsService = connectionsService;
        this.userService = userService;
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<ReqUser> getUser(@PathVariable Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();

        User thisUser = userService.getUserByUsername(currentUsername);
        User otherUser = userService.getUserById(id);

        if (thisUser == otherUser) {
            ReqUser reqUser = new ReqUser();
            reqUser.name = thisUser.getProfile().getName();
            reqUser.profileLink = "http://localhost:8080/req/users/" + id + "/profile";
            return ResponseEntity.ok().body(reqUser);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/users/{id}/picture")
    public ResponseEntity<String> getPicture(@PathVariable Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();

        User thisUser = userService.getUserByUsername(currentUsername);
        User otherUser = userService.getUserById(id);

        if (thisUser == otherUser && thisUser.getProfile().getProfilePicture() != null) {
            String image = Base64.getEncoder().encodeToString(thisUser.getProfile().getProfilePicture());
            return ResponseEntity.ok().body(image);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/users/{id}/profile")
    public ResponseEntity<UserProfileDTO> getProfile(@PathVariable Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();

        User thisUser = userService.getUserByUsername(currentUsername);
        User otherUser = userService.getUserById(id);

        if (thisUser == otherUser) {
            UserProfile userProfile = thisUser.getProfile();
            UserProfileDTO dto = new UserProfileDTO(userProfile);
            return ResponseEntity.ok().body(dto);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/users/{id}/bio")
    public ResponseEntity<Bio> getBio(@PathVariable Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();

        User thisUser = userService.getUserByUsername(currentUsername);
        User otherUser = userService.getUserById(id);

        if (thisUser == otherUser) {
            Bio bio = new Bio();
            bio.birthDate = thisUser.getProfile().getBirthDate();
            bio.gender = thisUser.getProfile().getGender();
            bio.location = thisUser.getProfile().getLocation();
            bio.interestedGames = thisUser.getInterestedGames();
            bio.interestedGenders = thisUser.getInterestedGenders();
            return ResponseEntity.ok().body(bio);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/recommendations")
    public ResponseEntity<List<Long>> getRecommendations() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();
        List<UserProfile> profiles = userService.getFilteredRecommendations(currentUsername);
        List<Long> ids = profiles.stream()
                .map(UserProfile::getId)
                .toList();
        if (ids.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok().body(ids);
    }

    @GetMapping("/connections")
    public ResponseEntity<List<Long>> getConnections() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();

        Long currentUserId = userService.getUserByUsername(currentUsername).getProfile().getId();
        List<Connection> connections = userService.getUserByUsername(currentUsername).getConnections();

        List<Long> otherUserIds = connections.stream()
                .flatMap(conn -> Stream.of(conn.getSender().getId(), conn.getReceiver().getId()))
                .filter(id -> !id.equals(currentUserId))
                .toList();

        if (otherUserIds.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok().body(otherUserIds);
    }

    public static class ReqUser {
        public String name;
        public String profileLink;
    }

    public static class Bio {
        public LocalDate birthDate;
        public String gender;
        public String location;
        public List<Game> interestedGames;
        public String[] interestedGenders;
    }
}
