package com.example.demo.webSocket;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Component;

import java.security.Principal;
import java.util.List;

/**
 * Intercepts STOMP messages sent through the WebSocket message channel.
 * <p>
 * This interceptor performs authentication and logging for STOMP commands such as CONNECT, SEND, and DISCONNECT.
 * It is useful for injecting security context, monitoring traffic, and debugging user interactions over WebSockets.
 */
@Component
public class WebSocketMessageInterceptor implements ChannelInterceptor {

    private static final Logger logger = LoggerFactory.getLogger(WebSocketMessageInterceptor.class);

    /**
     * Intercepts messages before they are sent to the message channel.
     * <p>
     * Handles key STOMP commands:
     * <ul>
     *     <li><b>CONNECT</b>: Extracts the username from the session attributes and sets an authenticated {@link Principal}.</li>
     *     <li><b>SEND</b>: Logs incoming message payloads, destinations, and session IDs.</li>
     *     <li><b>DISCONNECT</b>: Logs disconnection events including the session ID and user (if available).</li>
     * </ul>
     *
     * @param message the incoming STOMP message
     * @param channel the channel to which the message will be sent
     * @return the same or modified message to proceed down the channel
     */
    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (accessor != null && accessor.getCommand() != null) {
            StompCommand command = accessor.getCommand();

            switch (command) {
                case CONNECT -> {
                    // Set authenticated user from session attributes
                    String username = (String) accessor.getSessionAttributes().get("username");
                    if (username != null) {
                        logger.info("✅ User [{}] connected via WebSocket", username);
                        accessor.setUser(new UsernamePasswordAuthenticationToken(username, null, List.of()));
                    } else {
                        logger.warn("⚠️ No username found in session attributes during CONNECT");
                    }
                }
                case SEND -> {
                    // Log messages
                    String sessionId = accessor.getSessionId();
                    String destination = accessor.getDestination();
                    Object rawPayload = message.getPayload();
                    String payload = new String((byte[]) rawPayload);

                    logger.info("📨 Inbound message from session [{}] to [{}]: {}", sessionId, destination, payload);
                }
                case DISCONNECT -> {
                    String sessionId = accessor.getSessionId();
                    Principal user = accessor.getUser();
                    logger.info("❌ Session [{}] disconnected (user: {})", sessionId,
                            user != null ? user.getName() : "unknown");
                }
            }
        }

        return message;
    }
}
