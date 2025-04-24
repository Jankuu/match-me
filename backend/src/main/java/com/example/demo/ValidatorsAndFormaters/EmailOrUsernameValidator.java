package com.example.demo.ValidatorsAndFormaters;

import com.example.demo.Constraints.EmailOrUsername;
import com.example.demo.Utilities.EmailOrUsernameCarrier;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class EmailOrUsernameValidator implements ConstraintValidator<EmailOrUsername, EmailOrUsernameCarrier> {
    @Override
    public boolean isValid(EmailOrUsernameCarrier user, ConstraintValidatorContext context) {
        boolean isEmailEmpty = user.getEmail() == null || user.getEmail().trim().isEmpty();
        boolean isUsernameEmpty = user.getUsername() == null || user.getUsername().trim().isEmpty();

        return !(isEmailEmpty && isUsernameEmpty);
    }
}