package com.example.demo.dTOs;

import com.example.demo.constraints.ValidInterestedAge;
import com.example.demo.constraints.ValidInterestedGenders;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

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
    private UserConnectionDTO connections;
}
