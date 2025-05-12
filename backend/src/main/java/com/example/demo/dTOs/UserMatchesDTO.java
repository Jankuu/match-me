package com.example.demo.dTOs;

import com.example.demo.entities.UserProfile;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserMatchesDTO {
    private List<UserProfile> rejectedUsersProfiles = new ArrayList<>();
    private List<UserProfile> recommendedUserProfiles = new ArrayList<>();
}
