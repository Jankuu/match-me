package com.example.demo.validators;

import com.example.demo.constraints.ValidHeight;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class HeightValidator implements ConstraintValidator<ValidHeight, Integer> {
    @Override
    public boolean isValid(Integer height, ConstraintValidatorContext context) {
        return height == null || height < 300 && height > 50;
    }
}
