package com.example.demo.entities;

import com.example.demo.constraints.ValidInterestVectorAxis;
import com.example.demo.cTOs.UserInterestVectorDTO;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "userInterestVectors")
public class UserInterestVector {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ValidInterestVectorAxis
    private Integer fantasy;
    @ValidInterestVectorAxis
    private Integer competitive;
    @ValidInterestVectorAxis
    private Integer action;
    @ValidInterestVectorAxis
    private Integer story;
    @ValidInterestVectorAxis
    private Integer complex;

    public UserInterestVector(UserInterestVectorDTO interestVectorDTO) {
        this.fantasy = interestVectorDTO.getFantasy();
        this.competitive = interestVectorDTO.getCompetitive();
        this.action = interestVectorDTO.getAction();
        this.story = interestVectorDTO.getStory();
        this.complex = interestVectorDTO.getComplex();
    }
}
