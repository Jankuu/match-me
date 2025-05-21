package com.example.demo.dTOs;

import com.example.demo.constraints.ValidInterestedAge;
import com.example.demo.constraints.ValidInterestedGenders;
import com.example.demo.entities.Connection;
import com.example.demo.entities.Game;
import com.example.demo.entities.User;
import com.example.demo.entities.UserProfile;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
    private Long id;
    private String username;
    private String email;
    private String password;
    private UserProfileDTO profile;

    @ValidInterestedAge
    private Integer interestedMinAge;
    @ValidInterestedAge
    private Integer interestedMaxAge;
    @ValidInterestedGenders
    private String[] interestedGenders;

    private UserInterestVectorDTO interestVector;

    private List<Game> interestedGames;

    private List<UserProfile> recommendedUserProfiles;

    private List<Connection> connectionRequests;
    private List<Connection> connections;

    public UserDTO(User user) {
        this.id = user.getId();
        this.username = user.getUsername();
        this.email = user.getEmail();
        this.password = user.getPassword();
        this.profile = new UserProfileDTO(user.getProfile());
        this.interestedMinAge = user.getInterestedMinAge();
        this.interestedMaxAge = user.getInterestedMaxAge();
        this.interestedGenders = user.getInterestedGenders();
        this.interestVector = new UserInterestVectorDTO(user.getInterestVector());
        this.connectionRequests = user.getConnectionRequests();
        this.connections = user.getConnections();
        this.recommendedUserProfiles = user.getRecommendedUserProfiles();
        this.interestedGames = user.getInterestedGames();
    }
}
