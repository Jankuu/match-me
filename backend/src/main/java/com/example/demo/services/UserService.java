package com.example.demo.services;

import com.example.demo.dtos.UserRegistrationDTO;
import com.example.demo.entities.User;
import com.example.demo.repositories.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User registerUser(UserRegistrationDTO dto, MultipartFile image) throws IOException {
        User user = new User(dto.getName(), dto.getEmail(), dto.getPassword());

        // optionally save image
        if (image != null && !image.isEmpty()) {
            // you can save it to DB, file system, or cloud — depending on your setup
            System.out.println("Image uploaded: " + image.getOriginalFilename());
        }

        return userRepository.save(user);
    }
}
