package com.example.demo.Exeptions;

import lombok.Getter;

@Getter
public class EmailAlreadyExistsException extends RuntimeException {
    private final Object conflictingEntity;

    public EmailAlreadyExistsException(String message, Object conflictingEntity) {
        super(message);
        this.conflictingEntity = conflictingEntity;
    }
}