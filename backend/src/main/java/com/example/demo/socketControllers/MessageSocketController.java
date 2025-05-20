package com.example.demo.socketControllers;

import com.example.demo.dTOs.MessageDTO;
import com.example.demo.services.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.util.Objects;

@Controller
public class MessageSocketController {
    private final MessageService messageService;
    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    public MessageSocketController(MessageService messageService) {
        this.messageService = messageService;
    }

    @MessageMapping("/send") // Maps to /app/send
    public void receiveAMessage(@Payload String message,
                                Principal principal,
                                SimpMessageHeaderAccessor headerAccessor) {
        System.out.println("Sender Principal: " + principal.getName());
        if (message == null || message.isBlank()) {
            System.out.println("Message is null or blank");
            return;
        }

        String sender = principal.getName(); // ✅ Comes from your JWT and handshake setup

        int firstSpace = message.indexOf(" ");
        if (firstSpace > 1) {
            String targetUser = message.substring(1, firstSpace);
            String msgContent = message.substring(firstSpace + 1);

            messagingTemplate.convertAndSendToUser(
                    targetUser,
                    "/queue/messages",
                    sender + ": " + msgContent
            );

            messagingTemplate.convertAndSendToUser(
                    sender,
                    "/queue/messages",
                    sender + ": " + msgContent
            );

            MessageDTO messageDTO = new MessageDTO();
            messageDTO.setReceiverUsername(targetUser);
            messageDTO.setSenderUsername(sender);
            messageDTO.setContent(msgContent);

            messageService.sendMessage(messageDTO);
        }
    }

    @MessageMapping("/register")
    public void registerUser(@Payload String username, SimpMessageHeaderAccessor headerAccessor) {
        Objects.requireNonNull(headerAccessor.getSessionAttributes()).put("username", username);
    }
}