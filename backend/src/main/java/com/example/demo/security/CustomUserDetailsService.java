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

    /**
     * Loads the user by their username or email for authentication purposes.
     * <p>
     * This method first attempts to find a user by their username. If not found, it then tries
     * to find the user by their email. If neither search returns a result, a
     * {@link UsernameNotFoundException} is thrown.
     * <p>
     * Once the user is retrieved, a {@link org.springframework.security.core.userdetails.User}
     * instance is created with a consistent identifier (preferring the username if available,
     * otherwise falling back to the email), the user's password, and an empty list of authorities.
     *
     * @param usernameOrEmail the username or email used to look up the user
     * @return a Spring Security {@link UserDetails} object for authentication
     * @throws UsernameNotFoundException if no user is found with the provided identifier
     */
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
