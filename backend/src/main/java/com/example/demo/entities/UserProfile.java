package com.example.demo.entities;

import com.example.demo.constraints.ValidBirthDate;
import com.example.demo.constraints.ValidGender;
import com.example.demo.constraints.ValidHeight;
import com.example.demo.constraints.ValidName;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "user_profiles")
public class UserProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    // @NotNull(message = "User name must not be null!")
    // @NotBlank(message = "User name must not be blank!")
    @ValidName
    private String name;
    private byte[] profilePicture;
    @ValidBirthDate
    private LocalDate birthDate;
    @ValidGender
    private String gender;
    @ValidHeight
    private Integer height;
    @Column(length = 300)
    private String description;

    private String location;

    // Reference to interested games from User entity
    @Transient
    private List<Game> interestedGames;
}
