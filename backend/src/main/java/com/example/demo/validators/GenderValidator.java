package com.example.demo.validators;

import com.example.demo.constraints.ValidGender;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.util.Objects;

public class GenderValidator implements ConstraintValidator<ValidGender, String> {
    @Override
    public boolean isValid(String gender, ConstraintValidatorContext context) {
        return gender == null || gender.isBlank() || (Objects.equals(gender, "man") || Objects.equals(gender, "woman"));
    }
}
