package com.example.demo.ValidatorsAndFormaters;

import com.example.demo.Constraints.ValidInterestVectorAxis;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class InterestsVectorAxisValidator implements ConstraintValidator<ValidInterestVectorAxis, Integer> {
    @Override
    public boolean isValid(Integer axis, ConstraintValidatorContext context) {
        return axis == null || (axis >= 0 && axis <= 100);
    }
}
