package com.example.demo.dTOs;


import com.example.demo.constraints.ValidBirthDate;
import com.example.demo.constraints.ValidGender;
import com.example.demo.constraints.ValidHeight;
import com.example.demo.constraints.ValidName;
import com.example.demo.entities.UserProfile;
import com.example.demo.validators.FormatName;
import jakarta.persistence.Column;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.Base64;
import java.util.Optional;

@Getter
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
    }

    // GETTERS AND SETTER
    public String getName() {
        return FormatName.getFormatedName(name);
    }
}