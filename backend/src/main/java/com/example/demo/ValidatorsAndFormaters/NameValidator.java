package com.example.demo.ValidatorsAndFormaters;

import com.example.demo.Constraints.ValidName;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class NameValidator implements ConstraintValidator<ValidName, String> {
    @Override
    public boolean isValid(String name, ConstraintValidatorContext context) {
        return name == null || name.isBlank() || !name.matches(".*[^a-zA-Z\\s'-].*");
    }
}