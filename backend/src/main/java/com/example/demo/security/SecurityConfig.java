package com.example.demo.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * Main Spring Security configuration class.
 * <p>
 * Sets up password encoding, authentication management, HTTP security rules,
 * JWT filtering, and CORS configuration for the application.
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    /**
     * Main Spring Security configuration class.
     * <p>
     * Sets up password encoding, authentication management, HTTP security rules,
     * JWT filtering, and CORS configuration for the application.
     */
    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    /**
     * Defines the password encoder bean used for encoding and verifying passwords.
     * <p>
     * This implementation uses BCrypt for secure password hashing.
     *
     * @return a {@link BCryptPasswordEncoder} instance
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Provides an {@link AuthenticationManager} bean using the Spring Security configuration.
     * <p>
     * This manager is responsible for processing authentication requests.
     *
     * @param authenticationConfiguration the authentication configuration provided by Spring
     * @return the {@link AuthenticationManager} instance
     * @throws Exception if the authentication manager cannot be created
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    /**
     * Configures the main security filter chain for the application.
     * <p>
     * This setup:
     * <ul>
     *     <li>Enables CORS with custom configuration</li>
     *     <li>Disables CSRF protection (suitable for stateless REST APIs)</li>
     *     <li>Specifies public and protected endpoints</li>
     *     <li>Applies stateless session management using JWTs</li>
     *     <li>Adds a custom JWT filter before the username-password filter</li>
     * </ul>
     *
     * @param http the {@link HttpSecurity} to configure
     * @return the built {@link SecurityFilterChain}
     * @throws Exception if an error occurs while building the security configuration
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/auth/login").permitAll()
                        .requestMatchers("/users/register").permitAll() // Allow registration
                        .requestMatchers("/ws/**").permitAll() // WebSocket connections
                        .requestMatchers("/games").permitAll() // Games
                        // Debugging
                        .requestMatchers("/auth/test/login").permitAll()
                        .requestMatchers("/users/all").permitAll()
                        //       .requestMatchers("/connections/**").permitAll()
                        //       .requestMatchers("/messages/**").permitAll()
                        .anyRequest().authenticated()
                )
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /**
     * Defines the CORS configuration for the application.
     * <p>
     * This setup allows requests from the specified origin, supports all standard HTTP methods,
     * allows all headers, and includes credentials (cookies/authorization headers).
     *
     * @return the configured {@link CorsConfigurationSource}
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:5173"));
        config.setAllowedMethods(List.of("GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
