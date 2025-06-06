package com.example.demo.socketControllers;

import com.example.demo.dTOs.MessageDTO;
import com.example.demo.entities.User;
import com.example.demo.services.MessageService;
import com.example.demo.services.UserService;
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
    private final UserService userService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    public MessageSocketController(MessageService messageService, UserService userService) {
        this.messageService = messageService;
        this.userService = userService;
    }

    @MessageMapping("/send")
    public void receiveAMessage(@Payload MessageDTO messageDTO,
                                Principal principal,
                                SimpMessageHeaderAccessor headerAccessor) {
        Long senderProfileId = Long.parseLong(principal.getName());
        User senderUser = userService.getUserByProfileId(senderProfileId);
        messageDTO.setSenderProfileId(senderProfileId);
        User receiverUser = userService.getUserByProfileId(messageDTO.getReceiverProfileId());

        messagingTemplate.convertAndSendToUser(
                receiverUser.getProfile().getId().toString(),
                "/queue/messages",
                messageDTO
        );

        messagingTemplate.convertAndSendToUser(
                senderProfileId.toString(),
                "/queue/messages",
                messageDTO
        );

        messageService.saveMessage(messageDTO, senderUser, receiverUser);
    }

    @MessageMapping("/register")
    public void registerUser(@Payload String username, SimpMessageHeaderAccessor headerAccessor) {
        Objects.requireNonNull(headerAccessor.getSessionAttributes()).put("username", username);
    }
}