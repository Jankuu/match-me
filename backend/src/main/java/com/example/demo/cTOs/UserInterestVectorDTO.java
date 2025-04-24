package com.example.demo.cTOs;

import com.example.demo.constraints.ValidInterestVectorAxis;
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
}
