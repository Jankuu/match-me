package com.example.demo.restControllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.repositories.UserRepository;

@RestController
@RequestMapping("/images")
public class ImageController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/{userId}")
    public ResponseEntity<byte[]> getProfilePicture(@PathVariable Long userId) {
        return (ResponseEntity<byte[]>) userRepository.findById(userId)
                .map(user -> {
                    byte[] imageBytes = user.getProfile().getProfilePicture();
                    if (imageBytes == null || imageBytes.length == 0) {
                        return ResponseEntity.notFound().build();
                    }
                    HttpHeaders headers = new HttpHeaders();
                    headers.setContentType(MediaType.IMAGE_JPEG); // или PNG, если нужно
                    return new ResponseEntity<>(imageBytes, headers, HttpStatus.OK);
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
