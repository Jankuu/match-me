package com.example.demo.restControllers;

import com.example.demo.dTOs.MessageDTO;
import com.example.demo.dTOs.UserLinkDTO;
import com.example.demo.services.MessageService;
import lombok.AllArgsConstructor;
import lombok.Getter;
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

    @GetMapping("/search")
    public Page<MessageDTO> getSearchedMessages(
            @RequestBody SearchMessages searchMessages,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return messageService.getSearchedMessages(searchMessages, page, size);
    }

    // POST
    @PostMapping("/send")
    public MessageDTO sendMessage(@RequestBody MessageDTO messageDTO) {
        return messageService.sendMessage(messageDTO);
    }

    @PostMapping("/save")
    public List<MessageDTO> saveMessages(@RequestBody SaveMessages saveMessages) {
        return messageService.saveMessages(saveMessages.getUserLinkDTO(), saveMessages.getMessageDTOS());
    }

    // PATCH
    @PatchMapping
    public MessageDTO patchMessage(@RequestParam Long messageId, @RequestBody String content) {
        return messageService.patchMessage(messageId, content);
    }
    // DELETE

    // HELPER METHODS
    @Getter
    @AllArgsConstructor
    public static class SaveMessages {
        private UserLinkDTO userLinkDTO;
        private List<MessageDTO> messageDTOS;
    }

    @Getter
    @AllArgsConstructor
    public static class SearchMessages {
        private UserLinkDTO userLinkDTO;
        private String searchTerm;
    }
}
