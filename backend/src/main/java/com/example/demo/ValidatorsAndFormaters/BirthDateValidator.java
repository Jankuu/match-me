package com.example.demo.ValidatorsAndFormaters;

import com.example.demo.Constraints.ValidBirthDate;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.time.LocalDate;
import java.time.Period;

public class BirthDateValidator implements ConstraintValidator<ValidBirthDate, LocalDate> {
    @Override
    public boolean isValid(LocalDate birthDate, ConstraintValidatorContext context) {
        if (birthDate == null) {
            return true;
        }
        LocalDate currentDate = LocalDate.now();

        if (birthDate.isAfter(currentDate)) {
            return false;
        }
        Period age = Period.between(birthDate, currentDate);
        return age.getYears() >= 18;
    }
}
