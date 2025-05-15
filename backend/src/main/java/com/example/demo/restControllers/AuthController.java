package com.example.demo.restControllers;

import com.example.demo.dTOs.AuthResponseDTO;
import com.example.demo.dTOs.LoginDTO;
import com.example.demo.entities.UserProfile;
import com.example.demo.services.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@RequestBody LoginDTO loginDTO) {
        return ResponseEntity.ok(authService.authenticate(loginDTO));
    }

    @PostMapping("/test/login")
    public ResponseEntity<AuthResponseDTO> testLogin(Long id) {
        return ResponseEntity.ok(authService.testLogin(id));
    }
}
