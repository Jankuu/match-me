package com.example.demo.ValidatorsAndFormaters;

import com.example.demo.Constraints.ValidHeight;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class HeightValidator implements ConstraintValidator<ValidHeight, Integer> {
    @Override
    public boolean isValid(Integer height, ConstraintValidatorContext context) {
        return height == null || height < 300 && height > 50;
    }
}
