package com.example.demo.Constraints;

import com.example.demo.ValidatorsAndFormaters.InterestsVectorAxisValidator;
import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target({ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = InterestsVectorAxisValidator.class)
public @interface ValidInterestVectorAxis {
    String message() default "Invalid interests vector axis. Interests vector axis must be more or equal to 0 and less or equal to 100.";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}