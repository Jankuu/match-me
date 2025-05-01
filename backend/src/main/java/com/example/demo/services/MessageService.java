package com.example.demo.services;

import com.example.demo.dTOs.MessageDTO;
import com.example.demo.dTOs.UserLinkDTO;
import com.example.demo.entities.Message;
import com.example.demo.entities.User;
import com.example.demo.exceptions.ResourceNotFoundException;
import com.example.demo.repositories.MessageRepository;
import com.example.demo.repositories.UserRepository;
import com.example.demo.restControllers.MessageController;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MessageService {
    private final MessageRepository messageRepository;
    private final UserService userService;
    private final UserRepository userRepository;

    public MessageService(MessageRepository messageRepository, UserService userService, UserRepository userRepository) {
        this.messageRepository = messageRepository;
        this.userService = userService;
        this.userRepository = userRepository;
    }

    // GET
    public Page<MessageDTO> getMessagesBetweenUsers(UserLinkDTO userLinkDTO, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("timestamp").descending());
        Long userId1 = userService.getUser(userLinkDTO.getReceiverID(), userLinkDTO.getReceiverUsername(), userLinkDTO.getReceiverEmail()).getId();
        Long userId2 = userService.getUser(userLinkDTO.getSenderID(), userLinkDTO.getSenderUsername(), userLinkDTO.getSenderEmail()).getId();

        Page<Message> messagePage = messageRepository.findMessagesBetweenUsers(userId1, userId2, pageable);
        return messagePage.map(MessageDTO::new);
    }

    public Page<MessageDTO> getSearchedMessages(MessageController.SearchMessages searchMessages, int page, int size) {
        Long userId1 = searchMessages.getUserLinkDTO().getReceiverID();
        Long userId2 = searchMessages.getUserLinkDTO().getSenderID();
        Pageable pageable = PageRequest.of(page, size, Sort.by("timestamp").descending());
        Page<Message> foundMessages = messageRepository.searchMessagesBetweenUsers(userId1, userId2, searchMessages.getSearchTerm(), pageable);
        return foundMessages.map(MessageDTO::new);
    }

    // POST
    public MessageDTO sendMessage(MessageDTO messageDTO) {
        User sender = userRepository.findById(messageDTO.getSenderId()).orElseThrow(() -> new ResourceNotFoundException("Could not find user by id", messageDTO.getSenderId()));
        User receiver = userRepository.findById(messageDTO.getReceiverId()).orElseThrow(() -> new ResourceNotFoundException("Could not find user by id", messageDTO.getReceiverId()));

        Message message = new Message();
        message.setSenderId(sender.getId());
        message.setReceiverId(receiver.getId());
        message.setContent(messageDTO.getContent());

        messageRepository.save(message);

        sender.getMessages().add(message);
        receiver.getMessages().add(message);

        userRepository.saveAll(List.of(sender, receiver));

        return new MessageDTO(message);
    }

    public List<MessageDTO> saveMessages(UserLinkDTO userLinkDTO, List<MessageDTO> messageDTOS) {
        return null;
    }

    // PATCH
    public MessageDTO patchMessage(Long messageId, String content) {
    }

    // DELETE

    // HELPER METHODS
}
