package com.example.demo.DTOs;


import com.example.demo.Constraints.ValidBirthDate;
import com.example.demo.Constraints.ValidGender;
import com.example.demo.Constraints.ValidHeight;
import com.example.demo.Constraints.ValidName;
import com.example.demo.Entities.Connection;
import com.example.demo.Entities.User;
import com.example.demo.Entities.UserProfile;
import com.example.demo.ValidatorsAndFormaters.FormatName;
import jakarta.persistence.Column;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileDTO {
    @ValidName
    private String name;
    private byte[] profilePicture;
    @ValidBirthDate
    private LocalDate birthDate;
    @ValidGender
    private String gender;
    @ValidHeight
    private Integer height;
    private String description;

    public UserProfileDTO(UserProfile userProfile) {
        this.name = userProfile.getName();
        this.profilePicture = userProfile.getProfilePicture();
        this.birthDate = userProfile.getBirthDate();
        this.gender = userProfile.getGender();
        this.height = userProfile.getHeight();
        this.description = userProfile.getDescription();
    }


    // GETTERS AND SETTER
    public String getName() {
        return FormatName.getFormatedName(name);
    }
}