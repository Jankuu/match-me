package com.example.demo.dTOs;


import com.example.demo.constraints.ValidBirthDate;
import com.example.demo.constraints.ValidGender;
import com.example.demo.constraints.ValidHeight;
import com.example.demo.constraints.ValidName;
import com.example.demo.validators.FormatName;
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
    private String profilePicture;
    @ValidBirthDate
    private LocalDate birthDate;
    @ValidGender
    private String gender;
    @ValidHeight
    private Integer height;
    private String description;

    // GETTERS AND SETTER
    public String getName() {
        return FormatName.getFormatedName(name);
    }
}