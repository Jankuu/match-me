package com.example.demo.dtos;

public class UserRegistrationDTO {
    private String name;
    private String email;
    private String password;
    private String birthDate; 
    private String preferredGender;
    private String location; 
    private String imageUrl;
    private Integer minAge; 
    private Integer maxAge; 
    private Boolean isOnline;

    // Getters & Setters
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getBirthDate() {
        return birthDate;
    }

    public void setBirthDate(String birthDate) {
        this.birthDate = birthDate;
    }

    public String getPreferredGender() {
        return preferredGender;
    }

    public void setPreferredGender(String preferredGender) {
        this.preferredGender = preferredGender;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public Integer getMinAge() {
        return minAge;
    }

    public void setMinAge(Integer minAge) {
        this.minAge = minAge;
    }

    public Integer getMaxAge() {
        return maxAge;
    }

    public void setMaxAge(Integer maxAge) {
        this.maxAge = maxAge;
    }

    public void setIsOnline(Boolean isOnline) {
        this.isOnline = isOnline;
    }

    // Constructor
    public UserRegistrationDTO(
        String name, 
        String email, 
        String password, 
        String birthDate, 
        String preferredGender, 
        String location, 
        String imageUrl, 
        Integer minAge, 
        Integer maxAge, 
        Boolean isOnline) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.birthDate = birthDate;
        this.preferredGender = preferredGender;
        this.location = location;
        this.imageUrl = imageUrl;
        this.minAge = minAge;
        this.maxAge = maxAge;
        this.isOnline = isOnline;
    }

    public UserRegistrationDTO(
        String name, 
        String email, 
        String password, 
        String birthDate, 
        String preferredGender, 
        String location,
        Integer minAge, 
        Integer maxAge) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.birthDate = birthDate;
        this.preferredGender = preferredGender;
        this.location = location;
        this.imageUrl = "";
        this.minAge = minAge;
        this.maxAge = maxAge;
        this.isOnline = false;
    }

    
    public UserRegistrationDTO() {}
}
