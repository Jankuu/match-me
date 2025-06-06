package com.example.demo.socketControllers;

import com.example.demo.dTOs.MessageDTO;
import com.example.demo.services.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
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

    @MessageMapping("/send")
    public void receiveAMessage(@Payload MessageDTO messageDTO,
                                Principal principal,
                                SimpMessageHeaderAccessor headerAccessor) {

        String sender = principal.getName();
        String receiver = messageDTO.getReceiverUsername();

        messageDTO.setSenderUsername(sender);

        messagingTemplate.convertAndSendToUser(
                receiver,
                "/queue/messages",
                messageDTO
        );

        messagingTemplate.convertAndSendToUser(
                sender,
                "/queue/messages",
                messageDTO
        );

        messageService.saveMessage(messageDTO);
    }

    @MessageMapping("/register")
    public void registerUser(@Payload String username, SimpMessageHeaderAccessor headerAccessor) {
        Objects.requireNonNull(headerAccessor.getSessionAttributes()).put("username", username);
    }
}