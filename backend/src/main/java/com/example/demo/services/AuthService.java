package com.example.demo.services;

import com.example.demo.dTOs.UserDTO;
import com.example.demo.entities.User;
import com.example.demo.entities.UserProfile;
import com.example.demo.exceptions.ResourceNotFoundException;
import com.example.demo.repositories.UserRepository;
import com.example.demo.restControllers.AuthController;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final MatchingService matchingService;

    public AuthService(UserRepository userRepository, MatchingService matchingService) {
        this.userRepository = userRepository;
        this.matchingService = matchingService;
    }


    public UserDTO login(AuthController.LoginDTO loginDTO) {
        User user = userRepository.findByUsername(loginDTO.getUsername()).orElseThrow(() -> new ResourceNotFoundException("Could not find user with this username", loginDTO.getUsername()));

        if (!Objects.equals(user.getPassword(), loginDTO.getPassword())) {
            // LET FRONT END KNOW THAT LOGIN CREDENTIALS ARE WRONG
            return null;
        }

        // LOGIN
        List<UserProfile> recommendedUserProfiles = matchingService.getRecommendations(user);

        System.out.println(recommendedUserProfiles);

        user.setRecommendedUserProfiles(recommendedUserProfiles);

        userRepository.save(user);

        return new UserDTO(user);
    }

    // This gets matches without location filtering
    public List<UserProfile> testLogin(Long id) {
        User user = userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Could not find user with this id", id));

        List<UserProfile> recommendedUserProfiles = matchingService.getRecommendations(user);

        System.out.println(recommendedUserProfiles);

        user.setRecommendedUserProfiles(recommendedUserProfiles);

        userRepository.save(user);

        return recommendedUserProfiles;
    }
}
