package com.example.demo.services;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.util.Date;

/**
 * Service for handling JWT (JSON Web Token) operations such as generation, validation, and extraction.
 * <p>
 * Note: The secret key should be securely stored and injected via configuration, not hardcoded.
 */
@Service
public class JwtService {
    private final String SECRET_KEY = "your-very-secret-key"; // Should be kept secure
    /*
    @Value("${jwt.secret}")
    private String SECRET_KEY;
    */

    /**
     * Generates a JWT token for the given username.
     * <p>
     * The token is valid for 10 hours from the time of issuance.
     *
     * @param username the username to set as the subject of the token
     * @return the generated JWT token as a string
     */
    public String generateToken(String username) {
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 10)) // 10 hours
                .signWith(SignatureAlgorithm.HS256, SECRET_KEY)
                .compact();
    }

    /**
     * Extracts the username (subject) from the provided JWT token.
     *
     * @param token the JWT token
     * @return the username extracted from the token
     * @throws io.jsonwebtoken.JwtException if the token is invalid or tampered with
     */
    public String extractUsername(String token) {
        return Jwts.parser()
                .setSigningKey(SECRET_KEY)
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    /**
     * Validates the JWT token by checking that:
     * <ul>
     *     <li>The token is not expired</li>
     *     <li>The username in the token matches the {@link UserDetails}</li>
     * </ul>
     *
     * @param token       the JWT token
     * @param userDetails the user details to validate against
     * @return true if the token is valid and belongs to the user, false otherwise
     */
    public boolean validateToken(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }

    /**
     * Checks whether the provided JWT token has expired.
     *
     * @param token the JWT token
     * @return true if the token has expired, false otherwise
     */
    private boolean isTokenExpired(String token) {
        return Jwts.parser()
                .setSigningKey(SECRET_KEY)
                .parseClaimsJws(token)
                .getBody()
                .getExpiration()
                .before(new Date());
    }
}
