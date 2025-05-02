package com.example.demo.entities;

import com.example.demo.constraints.EmailOrUsername;
import com.example.demo.constraints.ValidInterestedAge;
import com.example.demo.constraints.ValidInterestedGenders;
import com.example.demo.utilities.EmailOrUsernameCarrier;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.locationtech.jts.geom.Point;

import java.util.ArrayList;
import java.util.List;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@EmailOrUsername
@Entity
@Table(name = "users")
public class User implements EmailOrUsernameCarrier {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String username;

    @Email
    @Column(unique = true)
    private String email;

    @NotNull(message = "User password must not be null!")
    @NotBlank(message = "User password must not be blank!")
    private String password;

    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "profile_id")
    private UserProfile profile;

    @ValidInterestedAge
    private Integer interestedMinAge;
    @ValidInterestedAge
    private Integer interestedMaxAge;
    @ValidInterestedGenders
    private String[] interestedGenders;

    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "interestVector_id")
    private UserInterestVector interestVector;

    @ManyToMany(cascade = CascadeType.ALL)
    private List<Connection> connections = new ArrayList<>();

    @ManyToMany(cascade = CascadeType.ALL)
    private List<Connection> connectionRequests = new ArrayList<>();

    /*
    Not sure if these should be kept under user or userProfile
     */
    private Boolean isGpsUser; // false if location chosen by city list

    @Column(columnDefinition = "geometry(Point, 4326)")
    private Point location; // for GPS users

    private Integer radius; // meters

    @ManyToOne
    @JoinColumn(name = "city_id")
    private City city;

}
