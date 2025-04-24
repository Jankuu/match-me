package com.example.demo.DTOs;

import com.example.demo.Constraints.EmailOrUsername;
import com.example.demo.Constraints.ValidInterestedAge;
import com.example.demo.Constraints.ValidInterestedGenders;
import com.example.demo.ValidatorsAndFormaters.EmailOrUsernameCarrier;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO implements EmailOrUsernameCarrier {
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
    private UserConnectionsDTO connections;
}
