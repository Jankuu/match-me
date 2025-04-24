package com.example.demo.services;

import com.example.demo.dtos.UserRegistrationDTO;
import com.example.demo.entities.User;
import com.example.demo.repositories.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.io.IOException;

@Service
public class UserService {

    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User registerUser(UserRegistrationDTO dto, MultipartFile image) throws IOException {
        // bcrypt password
        String encodedPassword = passwordEncoder.encode(dto.getPassword());

        User user = new User(
        dto.getName(), 
        dto.getEmail(), 
        encodedPassword,
        dto.getPreferredGender(),
        dto.getLocation(),
        dto.getMinAge(),  
        dto.getMaxAge(),
        dto.getBirthDate()
        );

    // if (image != null && !image.isEmpty()) {
    //     String imagePath = saveImage(image);
    //     user.setImageUrl(imagePath);
    // }

    User savedUser = userRepository.save(user);
    System.out.println("Saved user ID: " + savedUser.getId());
    
    return savedUser;
    }
}
