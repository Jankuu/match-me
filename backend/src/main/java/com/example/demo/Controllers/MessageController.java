package com.example.demo.Controllers;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class MessageController {

    @MessageMapping("/send") // Maps to /app/send
    @SendTo("/topic/messages") // Optional: echo back to frontend
    public String receiveMessage(@Payload String message) {
        System.out.println("📩 Received from React: " + message);
        return "You said: " + message; // Optional echo to all subscribers



    }
}