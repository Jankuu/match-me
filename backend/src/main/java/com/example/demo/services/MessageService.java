package com.example.demo.services;

import com.example.demo.dTOs.MessageDTO;
import com.example.demo.entities.Message;
import com.example.demo.entities.User;
import com.example.demo.exceptions.ResourceNotFoundException;
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
    public Page<MessageDTO> getMessagesBetweenUsers(UserLinkDTO userLinkDTO, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("timestamp").descending());

        String userUsername1 = userService.getUser(userLinkDTO.getReceiverId(), userLinkDTO.getReceiverUsername(), userLinkDTO.getReceiverEmail()).getUsername();
        String userUsername2 = userService.getUser(userLinkDTO.getSenderId(), userLinkDTO.getSenderUsername(), userLinkDTO.getSenderEmail()).getUsername();

        Page<Message> messagePage = messageRepository.findMessagesBetweenUsers(userUsername1, userUsername2, pageable);
        return messagePage.map(MessageDTO::new);
    }

/*
    public Page<MessageDTO> getSearchedMessages(MessageController.SearchMessages searchMessages, int page, int size) {
        Long userId1 = searchMessages.getUserLinkDTO().getReceiverId();
        Long userId2 = searchMessages.getUserLinkDTO().getSenderId();
        Pageable pageable = PageRequest.of(page, size, Sort.by("timestamp").descending());
        Page<Message> foundMessages = messageRepository.searchMessagesBetweenUsers(userId1, userId2, searchMessages.getSearchTerm(), pageable);
        return foundMessages.map(MessageDTO::new);
    }*/

    // POST
    @Transactional
    public MessageDTO sendMessage(MessageDTO messageDTO) {
        User sender = userRepository.findByUsername(messageDTO.getSenderUsername()).orElseThrow(() -> new ResourceNotFoundException("Could not find user by id", messageDTO.getSenderUsername()));
        User receiver = userRepository.findByUsername(messageDTO.getReceiverUsername()).orElseThrow(() -> new ResourceNotFoundException("Could not find user by id", messageDTO.getReceiverUsername()));

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

    /*
        public List<MessageDTO> saveMessages(List<MessageDTO> messageDTOS) {
            userRepository.findById(messageDTOS.getFirst().getSenderId()).orElseThrow(
                    () -> new ResourceNotFoundException("Could not find user by id", messageDTOS.getFirst().getSenderId()));
            userRepository.findById(messageDTOS.getFirst().getReceiverId()).orElseThrow(
                    () -> new ResourceNotFoundException("Could not find user by id", messageDTOS.getFirst().getReceiverId()));

            List<Message> messages = messageDTOS.stream()
                    .map(dto -> {
                        Message message = new Message();
                        message.setSenderId(dto.getSenderId());
                        message.setReceiverId(dto.getReceiverId());
                        message.setContent(dto.getContent());
                        message.setTimestamp(dto.getTimestamp());
                        return message;
                    })
                    .collect(Collectors.toList());

            List<Message> savedMessages = messageRepository.saveAll(messages);

            return savedMessages.stream()
                    .map(MessageDTO::new)
                    .collect(Collectors.toList());
        }
    */
    // PATCH
    public MessageDTO patchMessage(Long messageId, String content) {
        Message message = messageRepository.findById(messageId).orElseThrow(() -> new ResourceNotFoundException("Could not find message by id", messageId));
        message.setContent(content);
        messageRepository.save(message);
        return new MessageDTO(message);
    }

    // DELETE
    public MessageDTO deleteMessage(Long messageId) {
        Message message = messageRepository.findById(messageId).orElseThrow(() -> new ResourceNotFoundException("Could not find message by id", messageId));
        messageRepository.delete(message);
        return new MessageDTO(message);
    }

    // HELPER METHODS
}
