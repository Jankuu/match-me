package com.example.demo.Constraints;

import com.example.demo.ValidatorsAndFormaters.GenderValidator;
import com.example.demo.ValidatorsAndFormaters.NameValidator;
import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target({ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = GenderValidator.class)
public @interface ValidGender {
    String message() default "Invalid gender. Gender can only be 'man' or 'woman'.";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
