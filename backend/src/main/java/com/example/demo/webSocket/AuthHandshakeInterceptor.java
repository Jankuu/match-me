package com.example.demo.webSocket;

import com.example.demo.security.JwtUtil;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.util.Map;

/**
 * Intercepts WebSocket handshake requests to perform JWT-based authentication.
 * <p>
 * Extracts a token from the handshake request's query parameters, validates it using {@link JwtUtil},
 * and, if valid, attaches the authenticated username to the WebSocket session attributes.
 */
@Component
public class AuthHandshakeInterceptor implements HandshakeInterceptor {

    private final JwtUtil jwtUtil;

    public AuthHandshakeInterceptor(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    /**
     * Called before the WebSocket handshake is completed.
     * <p>
     * This method extracts the JWT token from the request parameters, validates it using {@link JwtUtil},
     * and stores the associated username in the session attributes if the token is valid.
     *
     * @param request    the HTTP request initiating the handshake
     * @param response   the HTTP response
     * @param wsHandler  the WebSocket handler
     * @param attributes a map to store attributes for the WebSocket session
     * @return true if the handshake should proceed (valid token), false otherwise
     * @throws Exception in case of unexpected validation errors
     */
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

        if (token != null && !token.isBlank() && token.contains(".")) {
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

    /**
     * Called after the WebSocket handshake is done.
     * <p>
     * This implementation does not perform any actions, but the method is required by the interface.
     *
     * @param request   the HTTP request
     * @param response  the HTTP response
     * @param wsHandler the WebSocket handler
     * @param exception any exception raised during the handshake, if any
     */
    @Override
    public void afterHandshake(ServerHttpRequest request,
                               ServerHttpResponse response,
                               WebSocketHandler wsHandler,
                               Exception exception) {
    }
}
