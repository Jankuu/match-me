package com.example.demo.entities;

import com.example.demo.constraints.ValidBirthDate;
import com.example.demo.constraints.ValidGender;
import com.example.demo.constraints.ValidHeight;
import com.example.demo.constraints.ValidName;
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
