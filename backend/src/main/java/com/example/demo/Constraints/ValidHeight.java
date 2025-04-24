package com.example.demo.Constraints;

import com.example.demo.ValidatorsAndFormaters.HeightValidator;
import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target({ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = HeightValidator.class)
public @interface ValidHeight {
    String message() default "Invalid height. Height must be over 50 and under 300.";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
