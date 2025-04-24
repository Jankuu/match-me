package com.example.demo.dTOs;

import com.example.demo.constraints.EmailOrUsername;
import com.example.demo.constraints.ValidInterestedAge;
import com.example.demo.constraints.ValidInterestedGenders;
import com.example.demo.utilities.EmailOrUsernameCarrier;
import jakarta.persistence.Column;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@EmailOrUsername
public class UserRegistrationDTO implements EmailOrUsernameCarrier {
    @Column(unique = true)
    private String username;
    @Email
    @Column(unique = true)
    private String email;
    @NotNull(message = "User password must not be null!")
    @NotBlank(message = "User password must not be blank!")
    private String password;
    private UserProfileDTO profile;

    @ValidInterestedAge
    private Integer interestedMinAge;
    @ValidInterestedAge
    private Integer interestedMaxAge;
    @ValidInterestedGenders
    private String[] interestedGenders;

    private UserInterestVectorDTO interestVector;
}
