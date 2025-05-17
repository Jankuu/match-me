package com.example.demo.webSocket;

import com.example.demo.security.JwtUtil;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.util.Map;

@Component
public class AuthHandshakeInterceptor implements HandshakeInterceptor {

    private final JwtUtil jwtUtil;

    public AuthHandshakeInterceptor(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    public boolean beforeHandshake(ServerHttpRequest request,
                                   ServerHttpResponse response,
                                   WebSocketHandler wsHandler,
                                   Map<String, Object> attributes) throws Exception {
        if (!(request instanceof ServletServerHttpRequest servletRequest)) {
            System.out.println("Handshake not valid: Not a ServletServerHttpRequest");
            return false;
        }

        String token = servletRequest.getServletRequest().getParameter("token");
        System.out.println("Token received: " + (token != null ? token.substring(0, Math.min(10, token.length())) + "..." : "null"));

        if (token != null && !token.isBlank()) {
            try {
                if (jwtUtil.validateToken(token)) {
                    String username = jwtUtil.extractUsername(token);
                    attributes.put("username", username);
                    System.out.println("Handshake valid for user: " + username);
                    return true;
                } else {
                    System.out.println("Handshake not valid: Token validation failed");
                }
            } catch (Exception e) {
                System.out.println("Handshake not valid: Exception during token validation: " + e.getMessage());
                e.printStackTrace();
            }
        } else {
            System.out.println("Handshake not valid: Token is null or blank");
        }

        return false;
    }

    @Override
    public void afterHandshake(ServerHttpRequest request,
                               ServerHttpResponse response,
                               WebSocketHandler wsHandler,
                               Exception exception) {
    }
}
