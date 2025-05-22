package com.example.demo.webSocket;

import org.springframework.http.server.ServerHttpRequest;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.support.DefaultHandshakeHandler;

import java.security.Principal;
import java.util.Map;

/**
 * Custom WebSocket handshake handler that assigns a {@link Principal} to the session.
 * <p>
 * This allows Spring Security and other components to recognize the authenticated user during the WebSocket session.
 * The username must be stored in the handshake attributes beforehand (typically by a {@link org.springframework.web.socket.server.HandshakeInterceptor}).
 */
public class CustomHandshakeHandler extends DefaultHandshakeHandler {

    /**
     * Determines the user for the WebSocket session by extracting the "username" from the handshake attributes.
     * <p>
     * Returns a simple {@link Principal} with the username as its name, allowing the session to be associated with the authenticated user.
     *
     * @param request    the HTTP request initiating the handshake
     * @param wsHandler  the WebSocket handler
     * @param attributes the attributes populated during the handshake, typically containing the authenticated username
     * @return a {@link Principal} with the username, or null if no valid username is found
     */
    @Override
    protected Principal determineUser(ServerHttpRequest request,
                                      WebSocketHandler wsHandler,
                                      Map<String, Object> attributes) {

        String username = (String) attributes.get("username");

        System.out.println("🔐 Setting Principal with username: " + username);

        return username != null ? () -> username : null;
    }
}