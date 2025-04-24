package com.example.demo.Constraints;

import com.example.demo.ValidatorsAndFormaters.InterestedAgeValidator;
import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target({ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = InterestedAgeValidator.class)
public @interface ValidInterestedAge {
    String message() default "Invalid interested age. Interested age must be under 200 and equal or over 18.";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
