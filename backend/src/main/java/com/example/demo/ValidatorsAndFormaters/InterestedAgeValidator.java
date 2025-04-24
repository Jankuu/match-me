package com.example.demo.ValidatorsAndFormaters;

import com.example.demo.Constraints.ValidInterestedAge;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class InterestedAgeValidator implements ConstraintValidator<ValidInterestedAge, Integer> {
    @Override
    public boolean isValid(Integer age, ConstraintValidatorContext context) {
        return age == null || (age < 200 && age >= 18);
    }
}
