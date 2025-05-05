package com.example.demo.entities;

import com.example.demo.constraints.ValidInterestVectorAxis;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "games")
public class Game {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @NotBlank
    private String name;

    @ValidInterestVectorAxis
    @NotNull
    private Integer fantasy;
    @ValidInterestVectorAxis
    @NotNull
    private Integer competitive;
    @ValidInterestVectorAxis
    @NotNull
    private Integer action;
    @ValidInterestVectorAxis
    @NotNull
    private Integer story;
    @ValidInterestVectorAxis
    @NotNull
    private Integer complex;

    public Game(String name, Integer fantasy, Integer competitive, Integer action, Integer story, Integer complex) {
        this.name = name;
        this.fantasy = fantasy;
        this.competitive = competitive;
        this.action = action;
        this.story = story;
        this.complex = complex;
    }
}
