package com.example.demo.Utilities;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Getter;
import lombok.Setter;

import java.util.Objects;


@Setter
@Getter
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiError {
    private String status;
    private String message;
    private String debugMessage;
    private Object conflictingSource; // Optional field for the conflicting entity

    /**
     * Constructs an ApiError object with the provided status, message, and exception details.
     * If the exception message differs from the provided message, the exception's localized message
     * is used as the debug message.
     *
     * @param status  the status of the error (e.g., "500 Internal Server Error").
     * @param message a human-readable message describing the error.
     * @param ex      the exception that caused the error, used to extract the localized debug message.
     */
    public ApiError(String status, String message, Throwable ex) {
        this.status = status;
        this.message = message;
        if (!Objects.equals(message, ex.getLocalizedMessage())) {
            this.debugMessage = ex.getLocalizedMessage();
        }
    }

    /**
     * Constructs an ApiError object for errors involving a conflicting entity.
     * The constructor initializes the error with the provided status, message, exception details,
     * and stores the conflicting entity for further reference.
     *
     * @param status            the status of the error (e.g., "409 Conflict").
     * @param message           a human-readable message describing the error.
     * @param ex                the exception that caused the error, used to extract the localized debug message.
     * @param conflictingEntity the entity that caused the conflict (e.g., a duplicate resource).
     */
    public ApiError(String status, String message, Throwable ex, Object conflictingEntity) {
        this(status, message, ex);
        this.conflictingSource = conflictingEntity;
    }
}
