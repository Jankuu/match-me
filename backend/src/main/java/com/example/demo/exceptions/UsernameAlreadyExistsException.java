package com.example.demo.exceptions;

import lombok.Getter;

@Getter
public class UsernameAlreadyExistsException extends RuntimeException {
    private final Object conflictingEntity;

    public UsernameAlreadyExistsException(String message, Object conflictingEntity) {
        super(message);
        this.conflictingEntity = conflictingEntity;
    }
}
