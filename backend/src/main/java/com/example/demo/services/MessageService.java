package com.example.demo.services;

import com.example.demo.dTOs.MessageDTO;
import com.example.demo.entities.Message;
import com.example.demo.entities.User;
import com.example.demo.repositories.MessageRepository;
import com.example.demo.repositories.UserRepository;
import jakarta.transaction.Transactional;
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
    public Page<MessageDTO> getMessagesBetweenUsers(String username, Long otherUserProfileId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("timestamp").descending());

        String userUsername2 = userService.getUserByProfileId(otherUserProfileId).getUsername();

        Page<Message> messagePage = messageRepository.findMessagesBetweenUsers(username, userUsername2, pageable);
        return messagePage.map(MessageDTO::new);
    }

    // POST
    @Transactional
    public MessageDTO saveMessage(MessageDTO messageDTO) {
        User sender = userService.getUserByUsername(messageDTO.getSenderUsername());
        User receiver = userService.getUserByUsername(messageDTO.getReceiverUsername());

        Message message = new Message();
        message.setSenderUsername(sender.getUsername());
        message.setReceiverUsername(receiver.getUsername());
        message.setContent(messageDTO.getContent());

        messageRepository.save(message);

        sender.getMessages().add(message);
        receiver.getMessages().add(message);

        userRepository.saveAll(List.of(sender, receiver));

        return new MessageDTO(message);
    }
}
