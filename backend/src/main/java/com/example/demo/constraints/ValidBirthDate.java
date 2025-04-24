package com.example.demo.constraints;

import com.example.demo.validators.BirthDateValidator;
import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target({ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = BirthDateValidator.class)
public @interface ValidBirthDate {
    String message() default "Invalid date. Birth date cannot be in the future or less than 18 years ago.";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
