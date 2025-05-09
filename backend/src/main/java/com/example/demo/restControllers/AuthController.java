package com.example.demo.restControllers;

import com.example.demo.dTOs.UserDTO;
import com.example.demo.dTOs.UserLinkDTO;
import com.example.demo.entities.User;
import com.example.demo.entities.UserProfile;
import com.example.demo.services.AuthService;
import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/auth")
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @GetMapping("/login")
    public UserDTO login(@RequestBody LoginDTO loginDTO){
        return authService.login(loginDTO);
    }

    @GetMapping("/test")
    public List<UserProfile> testLogin(@RequestParam Long id){
        return authService.testLogin(id);
    }

    // HELPER METHODS
    @Getter
    @AllArgsConstructor
    public static class LoginDTO {
        private String username;
        private String password;
    }
}
