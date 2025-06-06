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
        User user = userService.getUserByUsername(username);
        Long profileId = user.getProfile().getId();

        Page<Message> messagePage = messageRepository.findMessagesBetweenProfiles(profileId, otherUserProfileId, pageable);
        return messagePage.map(MessageDTO::new);
    }

    // POST
    @Transactional
    public void saveMessage(MessageDTO messageDTO, User sender, User receiver) {
        Message message = new Message();
        message.setReceiverProfileId(messageDTO.getReceiverProfileId());
        message.setSenderProfileId(messageDTO.getSenderProfileId());

        message.setContent(messageDTO.getContent());

        messageRepository.save(message);

        sender.getMessages().add(message);
        receiver.getMessages().add(message);

        userRepository.saveAll(List.of(sender, receiver));

        new MessageDTO(message);
    }
}
