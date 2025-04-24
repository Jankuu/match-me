package com.example.demo.validators;

import com.example.demo.constraints.ValidInterestVectorAxis;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class InterestsVectorAxisValidator implements ConstraintValidator<ValidInterestVectorAxis, Integer> {
    @Override
    public boolean isValid(Integer axis, ConstraintValidatorContext context) {
        return axis == null || (axis >= 0 && axis <= 100);
    }
}
