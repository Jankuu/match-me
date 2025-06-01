package com.example.demo.dTOs;


import com.example.demo.constraints.ValidBirthDate;
import com.example.demo.constraints.ValidGender;
import com.example.demo.constraints.ValidHeight;
import com.example.demo.constraints.ValidName;
import com.example.demo.entities.Game;
import com.example.demo.entities.UserProfile;
import com.example.demo.utilities.FormatName;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.Base64;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileDTO {
    private Long id;
    @ValidName
    private String name;
    private String profilePicture;
    @ValidBirthDate
    private LocalDate birthDate;
    @ValidGender
    private String gender;
    @ValidHeight
    private Integer height;
    private String description;
    private String location;
    private List<Game> interestedGames;

    public UserProfileDTO(UserProfile profile) {
        this.id = profile.getId();
        this.name = profile.getName();
        if (profile.getProfilePicture() == null){
            this.profilePicture = null;
        }else{
            this.profilePicture = Base64.getEncoder().encodeToString(profile.getProfilePicture());

        }
        this.birthDate = profile.getBirthDate();
        this.gender = profile.getGender();
        this.height = profile.getHeight();
        this.description = profile.getDescription();
        this.location = profile.getLocation();
        this.interestedGames = profile.getInterestedGames();
    }

    // GETTERS AND SETTER
    public String getName() {
        return FormatName.getFormatedName(name);
    }
}
