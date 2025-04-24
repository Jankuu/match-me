package com.example.demo.constraints;

import com.example.demo.validators.InterestedGendersValidator;
import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target({ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = InterestedGendersValidator.class)
public @interface ValidInterestedGenders {
    String message() default "Invalid interested genders. Interested genders can be 'man' or 'woman' or array of both.";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
