package com.example.demo.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.SignatureAlgorithm;
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

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

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

    private Boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    public String generateToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        return createToken(claims, userDetails.getUsername());
    }

    private String createToken(Map<String, Object> claims, String subject) {
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + jwtExpiration))
                .signWith(getSigningKey())
                .compact();
    }

    public Boolean validateToken(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }

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
}
