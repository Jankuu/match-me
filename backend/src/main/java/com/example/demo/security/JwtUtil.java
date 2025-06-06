package com.example.demo.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Component
public class JwtUtil {

    @Value("${jwt.expiration:86400000}") // Default to 24 hours if not specified
    private long jwtExpiration;

    @Value("${jwt.secret}")
    private String jwtSecret;

    /**
     * Generates a cryptographic signing key from the configured JWT secret.
     * <p>
     * The secret is converted to a byte array using UTF-8 encoding, and then used
     * to create an HMAC SHA key for signing or verifying JWT tokens.
     *
     * @return the {@link Key} used for signing and verifying JWTs
     * @throws IllegalArgumentException if the JWT secret is null or empty
     */
    private Key getSigningKey() {
        try {
            System.out.println("Getting signing key with secret: " + (jwtSecret != null ? jwtSecret.substring(0, Math.min(5, jwtSecret.length())) + "..." : "null"));
            if (jwtSecret == null || jwtSecret.isEmpty()) {
                throw new IllegalArgumentException("JWT secret is null or empty");
            }
            byte[] keyBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
            System.out.println("Key bytes length: " + keyBytes.length);
            Key key = Keys.hmacShaKeyFor(keyBytes);
            System.out.println("Key algorithm: " + key.getAlgorithm());
            return key;
        } catch (Exception e) {
            System.out.println("Failed to create signing key: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    /**
     * Extracts the username (subject) from the given JWT token.
     *
     * @param token the JWT token
     * @return the username extracted from the token
     */
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    /**
     * Extracts the expiration date from the given JWT token.
     *
     * @param token the JWT token
     * @return the expiration {@link Date} of the token
     */
    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    /**
     * Extracts a specific claim from the JWT token using the provided claim resolver function.
     *
     * @param token          the JWT token
     * @param claimsResolver a function to extract the desired claim from the token's claims
     * @param <T>            the type of the claim
     * @return the extracted claim
     */
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    /**
     * Parses the JWT token and extracts all claims contained within it.
     * <p>
     * Validates the token format and uses the signing key to parse and return the token's claims.
     *
     * @param token the JWT token
     * @return all claims contained in the token
     * @throws MalformedJwtException if the token format is invalid
     */
    private Claims extractAllClaims(String token) {
        try {
            // Check if token has valid JWT format before parsing
            if (token == null || token.isBlank() || !token.contains(".")) {
                throw new MalformedJwtException("Invalid JWT token format");
            }

            System.out.println("Attempting to extract claims from token: " + token.substring(0, Math.min(10, token.length())) + "...");
            Key signingKey = getSigningKey();
            System.out.println("Signing key algorithm: " + signingKey.getAlgorithm());
            Claims claims = Jwts.parserBuilder().setSigningKey(signingKey).build().parseClaimsJws(token).getBody();
            System.out.println("Claims extracted successfully: " + claims);
            return claims;
        } catch (Exception e) {
            System.out.println("Failed to extract claims: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    /**
     * Checks whether the given JWT token has expired.
     *
     * @param token the JWT token
     * @return true if the token is expired, false otherwise
     */
    private Boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    /**
     * Generates a JWT token for the given {@link UserDetails}.
     * <p>
     * This method creates a token with the user's username as the subject and a configured expiration.
     *
     * @param userDetails the user details for whom the token is generated
     * @return the generated JWT token as a String
     */
    public String generateToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        return createToken(claims, userDetails.getUsername());
    }

    /**
     * Creates a JWT token with the provided claims and subject.
     * <p>
     * Includes the issued time, expiration, and signs the token with the configured key.
     *
     * @param claims  a map of claims to include in the token
     * @param subject the subject (typically the username)
     * @return the signed JWT token
     */
    private String createToken(Map<String, Object> claims, String subject) {
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + jwtExpiration))
                .signWith(getSigningKey())
                .compact();
    }

    /**
     * Validates a JWT token against the provided {@link UserDetails}.
     * <p>
     * Checks that the token contains the expected username and has not expired.
     *
     * @param token       the JWT token
     * @param userDetails the user details to validate against
     * @return true if the token is valid, false otherwise
     */
    public Boolean validateToken(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }

    /**
     * Validates the structure and claims of a JWT token.
     * <p>
     * This method attempts to extract the username, and logs the outcome.
     *
     * @param token the JWT token
     * @return true if the token is valid, false otherwise
     */
    public boolean validateToken(String token) {
        try {
            String username = extractUsername(token); // exception will throw if invalid
            System.out.println("Token validation successful for user: " + username);
            return true;
        } catch (Exception e) {
            System.out.println("Token validation failed: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    // new
    /*
    public String generateToken(String username, Long profileId) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("profileId", profileId);
        return createToken(claims, username);
    }

    public Long extractProfileId(String token) {
        return extractAllClaims(token).get("profileId", Long.class);
    }*/
}
