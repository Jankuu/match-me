package com.example.demo.restControllers;

import com.example.demo.dTOs.MessageDTO;
import com.example.demo.dTOs.UserLinkDTO;
import com.example.demo.services.MessageService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
            @RequestBody UserLinkDTO userLinkDTO,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return messageService.getMessagesBetweenUsers(userLinkDTO, page, size);
    }

    // POST
    @PostMapping("/send")
    public MessageDTO sendMessage(@RequestBody MessageDTO messageDTO){
        return messageService.sendMessage(messageDTO);
    }

    @PostMapping("/save")
    public List<MessageDTO> saveMessages(@RequestBody UserLinkDTO userLinkDTO, @RequestBody List<MessageDTO> messageDTOS){
            return messageService.saveMessages(userLinkDTO, messageDTOS);
    }

    // PATCH

    // DELETE
}
