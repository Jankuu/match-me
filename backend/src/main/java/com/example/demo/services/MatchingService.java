package com.example.demo.services;

import com.example.demo.entities.User;
import com.example.demo.entities.UserProfile;
import com.example.demo.repositories.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MatchingService {
    private final UserRepository userRepository;

    public MatchingService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<UserProfile> getRecommendations(User user) {
        if (Boolean.TRUE.equals(user.getIsGpsUser())) {
            return userRepository.getRecommendations(user.getId())
                    .stream()
                    .map(User::getProfile)
                    .toList();
        }
        return null;
    }
}
