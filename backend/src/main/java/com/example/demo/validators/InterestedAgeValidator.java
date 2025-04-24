package com.example.demo.validators;

import com.example.demo.constraints.ValidInterestedAge;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class InterestedAgeValidator implements ConstraintValidator<ValidInterestedAge, Integer> {
    @Override
    public boolean isValid(Integer age, ConstraintValidatorContext context) {
        return age == null || (age < 200 && age >= 18);
    }
}
