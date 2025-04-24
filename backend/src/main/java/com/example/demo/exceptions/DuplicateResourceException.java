package com.example.demo.exceptions;

import lombok.Getter;

@Getter
public class DuplicateResourceException extends RuntimeException {
    private final Object conflictingEntity;

    public DuplicateResourceException(String message, Object conflictingEntity) {
        super(message);
        this.conflictingEntity = conflictingEntity;
    }
}
