package com.example.demo.utils;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

@Component
public class JwtUtil {
    private final SecretKey SECRET_KEY = Keys.hmacShaKeyFor(
    "supersecretkeysupersecretkey123456".getBytes() // минимум 32 байта!
);
    private final long EXPIRATION = 86400000; // 1 day

    public String generateToken(String email) {
        return Jwts.builder()
                .setSubject(email)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION))
                .signWith(SECRET_KEY, SignatureAlgorithm.HS256)
                .compact();
    }
}
