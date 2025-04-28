package com.example.demo.dTOs;

import com.example.demo.constraints.ValidInterestVectorAxis;
import com.example.demo.entities.UserInterestVector;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class UserInterestVectorDTO {
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

    public UserInterestVectorDTO(UserInterestVector interestVector) {
        this.fantasy = interestVector.getFantasy();
        this.competitive = interestVector.getCompetitive();
        this.action = interestVector.getAction();
        this.story = interestVector.getStory();
        this.complex = interestVector.getComplex();
    }
}
