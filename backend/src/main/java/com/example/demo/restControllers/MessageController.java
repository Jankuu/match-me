package com.example.demo.restControllers;

import com.example.demo.dTOs.MessageDTO;
import com.example.demo.services.MessageService;
import org.springframework.data.domain.Page;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/messages")
public class MessageController {
    private final MessageService messageService;

    public MessageController(MessageService messageService) {
        this.messageService = messageService;
    }

    // GET
    @GetMapping
    public Page<MessageDTO> getMessagesBetweenUsers(
            @RequestParam Long otherUserProfileId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();
        return messageService.getMessagesBetweenUsers(currentUsername, otherUserProfileId, page, size);
    }
}
