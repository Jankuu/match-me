package com.example.demo.ValidatorsAndFormaters;

import com.example.demo.Constraints.ValidInterestedGenders;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class InterestedGendersValidator implements ConstraintValidator<ValidInterestedGenders, String[]> {
    @Override
    public boolean isValid(String[] interestedGenders, ConstraintValidatorContext context) {
        if (interestedGenders == null) {
            return true;
        }
        if (interestedGenders.length != 1 && interestedGenders.length != 2) {
            return false;
        }
        boolean hasMan = false;
        boolean hasWoman = false;

        for (String gender : interestedGenders) {
            if (gender.equals("man")) {
                if (hasMan) return false;
                hasMan = true;
            } else if (gender.equals("woman")) {
                if (hasWoman) return false;
                hasWoman = true;
            } else {
                return false;
            }
        }
        return true;
    }
}
