package com.example.demo.entities;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String email;
    private String password;

    @Column(name = "birth_date")
    private String birthDate;

    @Column(name = "preferred_gender")
    private String preferredGender;

    private String location;

    @Column(name = "min_age")
    private Integer minAge;

    @Column(name = "max_age")
    private Integer maxAge;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "is_online")
    private boolean isOnline;

    public User() {}

    public User(String name, String email, String password, String preferredGender, String location, Integer minAge, Integer maxAge, String birthDate) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.preferredGender = preferredGender;
        this.location = location;
        this.minAge = minAge;
        this.maxAge = maxAge;
        this.isOnline = false;
        this.birthDate = birthDate;
    }

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getBirthDate() { return birthDate; }
    public void setBirthDate(String birthDate) { this.birthDate = birthDate; }

    public String getPreferredGender() { return preferredGender; }
    public void setPreferredGender(String preferredGender) { this.preferredGender = preferredGender; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public Integer getMinAge() { return minAge; }
    public void setMinAge(Integer minAge) { this.minAge = minAge; }

    public Integer getMaxAge() { return maxAge; }
    public void setMaxAge(Integer maxAge) { this.maxAge = maxAge; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public boolean isOnline() { return isOnline; }
    public void setOnline(boolean online) { isOnline = online; }
}
