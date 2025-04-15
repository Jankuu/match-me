package com.example.demo.controllers;

import com.example.demo.dtos.UserRegistrationDTO;
import com.example.demo.entities.User;
import com.example.demo.repositories.UserRepository;
import com.example.demo.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.ResponseEntity;

import java.io.IOException;

@RestController
@RequestMapping("/api/auth")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(
        @RequestPart("user") UserRegistrationDTO userRegistrationDTO,
        @RequestPart(value = "image", required = false) MultipartFile image
    ) throws IOException {
        userService.registerUser(userRegistrationDTO, image);
        return ResponseEntity.ok("User registered successfully");
    }
}
