package com.example.demo.constraints;

import java.lang.annotation.ElementType;

import com.example.demo.validators.EmailOrUsernameValidator;
import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target({ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = EmailOrUsernameValidator.class)
public @interface EmailOrUsername {
    String message() default "Email and username cannot both be null or empty";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
