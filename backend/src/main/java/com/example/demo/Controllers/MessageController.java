package com.example.demo.Controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.Objects;

@Controller
public class MessageController {
    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/send") // Maps to /app/send
    @SendTo("/topic/messages") // Optional: echo back to frontend
    public String receiveMessage(@Payload String message,SimpMessageHeaderAccessor headerAccessor) {
        if ("pass".equals(message)) {

            // messagingTemplate.convertAndSendToUser(
            //            accessor.getSessionId(),
            //            "/queue/online-users",
            //            payload
            //        );

            // 👇 Broadcast to all clients
            messagingTemplate.convertAndSend("/topic/broadcast", "🚨 Someone sent '11'!");
        }
        return "You said: " + message; // Optional echo to all subscribers
    }

    @MessageMapping("/register")
    public void registerUser(@Payload String username, SimpMessageHeaderAccessor headerAccessor) {
        Objects.requireNonNull(headerAccessor.getSessionAttributes()).put("username", username);
    }
}