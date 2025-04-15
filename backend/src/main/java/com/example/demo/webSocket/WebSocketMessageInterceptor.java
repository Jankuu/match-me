package com.example.demo.webSocket;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.stereotype.Component;

import java.util.Objects;

@Component
public class WebSocketMessageInterceptor implements ChannelInterceptor {

    private static final Logger logger = LoggerFactory.getLogger(WebSocketMessageInterceptor.class);

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor =
                MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (accessor != null && accessor.getCommand() != null) {
            if (Objects.requireNonNull(accessor.getCommand()) == StompCommand.SEND) {
                String sessionId = accessor.getSessionId();
                String destination = accessor.getDestination();
                Object rawPayload = message.getPayload();
                String payload = new String((byte[]) rawPayload); // only works for byte[] payloads

                logger.info("📨 Inbound message from session [{}] to [{}]: {}", sessionId, destination, payload);
            }
        }

        return message;
    }
}
