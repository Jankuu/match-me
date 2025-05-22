package com.example.demo.exceptions;

import lombok.Getter;

@Getter
public class TokenAndUserNotMatch extends RuntimeException {
    private final Object conflictingEntity;

    public TokenAndUserNotMatch(String message, Object conflictingEntity) {
        super(message);
        this.conflictingEntity = conflictingEntity;
    }
}
