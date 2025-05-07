package com.example.demo.security;

import com.example.demo.entities.User;
import com.example.demo.repositories.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String usernameOrEmail) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(usernameOrEmail)
                .orElseGet(() -> userRepository.findByEmail(usernameOrEmail)
                        .orElseThrow(() -> new UsernameNotFoundException(
                            "User not found with username or email: " + usernameOrEmail)));

        // Use a consistent identifier for the principal
        String userIdentifier = user.getUsername() != null && !user.getUsername().isEmpty() 
                ? user.getUsername() 
                : user.getEmail();

        return new org.springframework.security.core.userdetails.User(
                userIdentifier,
                user.getPassword(),
                new ArrayList<>()
        );
    }
}
