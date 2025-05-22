package com.example.demo.services;

import com.example.demo.dTOs.AuthResponseDTO;
import com.example.demo.dTOs.LoginDTO;
import com.example.demo.dTOs.UserDTO;
import com.example.demo.entities.User;
import com.example.demo.entities.UserProfile;
import com.example.demo.exceptions.ResourceNotFoundException;
import com.example.demo.repositories.UserRepository;
import com.example.demo.security.JwtUtil;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final MatchingService matchingService;
    private final PasswordEncoder passwordEncoder;

    public AuthService(
            UserRepository userRepository,
            AuthenticationManager authenticationManager,
            JwtUtil jwtUtil, MatchingService matchingService, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
        this.matchingService = matchingService;
        this.passwordEncoder = passwordEncoder;
    }

    public AuthResponseDTO authenticate(LoginDTO loginDTO) {
        try {
            System.out.println("Authenticating user: " + loginDTO.getUsernameOrEmail());

            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginDTO.getUsernameOrEmail(), loginDTO.getPassword())
            );
            System.out.println("Authentication successful");

            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            System.out.println("UserDetails username: " + userDetails.getUsername());

            String token = jwtUtil.generateToken(userDetails);
            System.out.println("Generated token: " + token.substring(0, Math.min(20, token.length())) + "...");

            // the identifier could be either username or email
            String identifier = userDetails.getUsername();
            User user = userRepository.findByUsername(identifier)
                    .orElseGet(() -> userRepository.findByEmail(identifier)
                            .orElseThrow(() -> new ResourceNotFoundException("User not found with username or email: " + identifier, null)));
            System.out.println("Found user: " + user.getUsername() + " (ID: " + user.getId() + ")");

            // Matching
            user.setRecommendedUserProfiles(matchingService.getFilteredRecommendations(user.getId()));
            userRepository.save(user);

            return new AuthResponseDTO(token, new UserDTO(user));
        } catch (BadCredentialsException e) {
            System.out.println("Authentication failed: " + e.getMessage());
            e.printStackTrace();
            throw new BadCredentialsException("Invalid username/email or password");
        } catch (Exception e) {
            System.out.println("Unexpected error during authentication: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    public AuthResponseDTO testLogin(Long id) {
        try {
            System.out.println("Test login for user ID: " + id);
            User user = userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Could not find user with this id", id));
            System.out.println("Found user: " + user.getUsername());

            // Generate token directly without authentication
            String token = jwtUtil.generateToken(org.springframework.security.core.userdetails.User
                    .withUsername(user.getUsername())
                    .password("")
                    .authorities("USER")
                    .accountExpired(false)
                    .accountLocked(false)
                    .credentialsExpired(false)
                    .disabled(false)
                    .build());

            System.out.println("Generated token for test login: " + token.substring(0, Math.min(20, token.length())) + "...");

            // Return response with token and user details
            return new AuthResponseDTO(token, new UserDTO(user));
        } catch (Exception e) {
            System.out.println("Error in test login: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
}
