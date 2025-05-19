package com.example.demo.exceptions;

import lombok.Getter;

@Getter
public class ConnectionAlreadyExistsException extends RuntimeException {
    private final Object conflictingEntity;

    public ConnectionAlreadyExistsException(String message, Object conflictingEntity) {
        super(message);
        this.conflictingEntity = conflictingEntity;
    }
}
