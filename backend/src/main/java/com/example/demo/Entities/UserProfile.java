package com.example.demo.Entities;

import com.example.demo.Constraints.ValidBirthDate;
import com.example.demo.Constraints.ValidGender;
import com.example.demo.Constraints.ValidHeight;
import com.example.demo.Constraints.ValidName;
import com.example.demo.DTOs.UserProfileDTO;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "userProfiles")
public class UserProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @NotNull(message = "User name must not be null!")
    @NotBlank(message = "User name must not be blank!")
    @ValidName
    private String name;
    private byte[] profilePicture;
    @ValidBirthDate
    private LocalDate birthDate;
    @ValidGender
    private String gender;
    @ValidHeight
    private Integer height;
    private String description;
}
