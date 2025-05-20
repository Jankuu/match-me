package com.example.demo.restControllers;

import com.example.demo.dTOs.MessageDTO;
import com.example.demo.services.MessageService;
import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/messages")
public class MessageController {
    private final MessageService messageService;

    public MessageController(MessageService messageService) {
        this.messageService = messageService;
    }

    // GET
    @PostMapping
    public Page<MessageDTO> getMessagesBetweenUsers(
            @RequestBody UserLinkDTO userLinkDTO,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return messageService.getMessagesBetweenUsers(userLinkDTO, page, size);
    }
/*
    @GetMapping("/search")
    public Page<MessageDTO> getSearchedMessages(
            @RequestBody SearchMessages searchMessages,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return messageService.getSearchedMessages(searchMessages, page, size);
    }
*/
    // POST
    @PostMapping("/send")
    public MessageDTO sendMessage(@RequestBody MessageDTO messageDTO) {
        return messageService.sendMessage(messageDTO);
    }

    /*
    @PostMapping("/save")
    public List<MessageDTO> saveMessages(@RequestBody List<MessageDTO> messageDTOS) {
        return messageService.saveMessages(messageDTOS);
    }
*/
    // PATCH
    @PatchMapping
    public MessageDTO patchMessage(@RequestParam Long messageId, @RequestBody String content) {
        return messageService.patchMessage(messageId, content);
    }

    // DELETE
    @DeleteMapping
    public MessageDTO deleteMessage(@RequestParam Long messageId){
        return messageService.deleteMessage(messageId);
    }

    // HELPER METHODS
    @Getter
    @AllArgsConstructor
    public static class SearchMessages {
        private UserLinkDTO userLinkDTO;
        private String searchTerm;
    }
}
