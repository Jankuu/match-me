package com.example.demo.utilities;

import com.example.demo.exceptions.EmailAlreadyExistsException;
import com.example.demo.exceptions.ResourceNotFoundException;
import com.example.demo.exceptions.UsernameAlreadyExistsException;
import jakarta.validation.ConstraintViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.stream.Collectors;

@ControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(EmailAlreadyExistsException.class)
    public ResponseEntity<ApiError> handleEmailAlreadyExists(EmailAlreadyExistsException ex) {
        ApiError error = new ApiError(
                "409 CONFLICT",
                ex.getMessage(),
                ex,
                ex.getConflictingEntity());
        return new ResponseEntity<>(error, HttpStatus.CONFLICT);
    }

    @ExceptionHandler(UsernameAlreadyExistsException.class)
    public ResponseEntity<ApiError> handleUsernameAlreadyExists(UsernameAlreadyExistsException ex) {
        ApiError error = new ApiError(
                "409 CONFLICT",
                ex.getMessage(),
                ex,
                ex.getConflictingEntity());
        return new ResponseEntity<>(error, HttpStatus.CONFLICT);
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiError> HandleResourceNotFound(ResourceNotFoundException ex) {
        ApiError error = new ApiError(
                "404 NOT_FOUND",
                ex.getMessage(),
                ex,
                ex.getConflictingEntity());
        return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
    }

    // Default
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> HandleGeneralException(Exception ex) {
        ApiError error = new ApiError("500 INTERNAL_SERVER_ERROR", "An unexpected error occurred", ex);
        return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiError> HandleConstraintViolationException(ConstraintViolationException ex) {
        String errorMessages = ex.getConstraintViolations().stream()
                .map(violation -> violation.getPropertyPath() + ": " + violation.getMessage())
                .collect(Collectors.joining(", "));
        ApiError error = new ApiError(
                "400 BAD_REQUEST",
                errorMessages,
                ex);
        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }
}
