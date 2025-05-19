package com.example.demo.services;

import com.example.demo.entities.User;
import com.example.demo.entities.UserProfile;
import com.example.demo.repositories.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MatchingService {
    private final UserRepository userRepository;
    private final UserService userService;

    public MatchingService(UserRepository userRepository, UserService userService) {
        this.userRepository = userRepository;
        this.userService = userService;
    }

    public List<UserProfile> getRecommendations(Long id) {
        User user = userService.getUser(id, null, null);
        if (user.getIsGpsUser()) {
            return userRepository.getRecommendations(id)
                    .stream()
                    .map(User::getProfile)
                    .toList();
        }
        return null;
    }

    public List<UserProfile> getFilteredRecommendations(Long id) {
        User user = userService.getUser(id, null, null);
        if (user.getIsGpsUser()) {
            return userRepository.getFilteredRecommendations(id)
                    .stream()
                    .map(User::getProfile)
                    .toList();
        }
        return null;
    }
}
