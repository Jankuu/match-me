package com.example.demo.socketControllers;

import com.example.demo.dTOs.MessageDTO;
import com.example.demo.entities.Connection;
import com.example.demo.services.ConnectionsService;
import com.example.demo.services.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.time.LocalDateTime;

@Controller
public class SocketController {
    private final MessageService messageService;
    private final ConnectionsService connectionsService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    public SocketController(MessageService messageService, ConnectionsService connectionsService) {
        this.messageService = messageService;
        this.connectionsService = connectionsService;
    }

    @MessageMapping("/send")
    public void sendMessage(@Payload MessageDTO messageDTO,
                            Principal principal,
                            SimpMessageHeaderAccessor headerAccessor) {
        Long senderProfileId = Long.parseLong(principal.getName());
        messageDTO.setSenderProfileId(senderProfileId);
        messageDTO.setTimestamp(LocalDateTime.now());

        messagingTemplate.convertAndSendToUser(
                messageDTO.getReceiverProfileId().toString(),
                "/queue/messages",
                messageDTO
        );

        messagingTemplate.convertAndSendToUser(
                senderProfileId.toString(),
                "/queue/messages",
                messageDTO
        );

        connectionsService.updateConnectionActivityTime(senderProfileId, messageDTO.getReceiverProfileId());
        messageService.saveMessage(messageDTO);
    }

    @MessageMapping("/read")
    public void readMessage(@Payload Long senderProfileId,
                            Principal principal,
                            SimpMessageHeaderAccessor headerAccessor) {
        Long receiverProfileId = Long.parseLong(principal.getName());
        //Long senderProfileId = messageDTO.getSenderProfileId();

        messagingTemplate.convertAndSendToUser(
                senderProfileId.toString(),
                "/queue/notifications/read",
                senderProfileId
        );

        messageService.readUnreadMessages(senderProfileId, receiverProfileId);
    }
}