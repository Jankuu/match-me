package com.example.demo.Constraints;

import com.example.demo.ValidatorsAndFormaters.HeightValidator;
import com.example.demo.ValidatorsAndFormaters.NameValidator;
import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target({ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = NameValidator.class)
public @interface ValidName {
    String message() default "Invalid name format. Name should not contain numbers or special symbols.";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}