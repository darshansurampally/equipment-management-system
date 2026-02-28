package com.equipmgmt.exception;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // -------------------------------------------------------
    // 422 — Business Rule Violations (30-day rule, etc.)
    // -------------------------------------------------------
    @ExceptionHandler(BusinessRuleException.class)
    public ResponseEntity<Map<String, Object>> handleBusinessRule(BusinessRuleException ex) {
        return buildResponse(HttpStatus.UNPROCESSABLE_ENTITY, "Business Rule Violation", ex.getMessage());
    }

    // -------------------------------------------------------
    // 404 — Resource Not Found
    // -------------------------------------------------------
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleNotFound(ResourceNotFoundException ex) {
        return buildResponse(HttpStatus.NOT_FOUND, "Not Found", ex.getMessage());
    }

    // -------------------------------------------------------
    // 400 — Bean Validation Errors (@Valid)
    // -------------------------------------------------------
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> fieldErrors = new HashMap<>();
        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            fieldErrors.put(error.getField(), error.getDefaultMessage());
        }

        Map<String, Object> body = new HashMap<>();
        body.put("status", HttpStatus.BAD_REQUEST.value());
        body.put("error", "Validation Failed");
        body.put("message", "One or more fields are invalid");
        body.put("fieldErrors", fieldErrors);
        body.put("timestamp", Instant.now());

        return ResponseEntity.badRequest().body(body);
    }

    // -------------------------------------------------------
    // 409 — Duplicate / FK Constraint Violations
    // -------------------------------------------------------
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, Object>> handleDataIntegrity(DataIntegrityViolationException ex) {
        String message = "Data integrity violation. The record may already exist or is referenced by another record.";
        return buildResponse(HttpStatus.CONFLICT, "Conflict", message);
    }

    // -------------------------------------------------------
    // 500 — Unexpected errors
    // -------------------------------------------------------
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGeneric(Exception ex) {
        return buildResponse(HttpStatus.INTERNAL_SERVER_ERROR, "Internal Server Error",
                "An unexpected error occurred. Please try again later.");
    }

    // -------------------------------------------------------
    // Helper
    // -------------------------------------------------------
    private ResponseEntity<Map<String, Object>> buildResponse(HttpStatus status, String error, String message) {
        Map<String, Object> body = new HashMap<>();
        body.put("status", status.value());
        body.put("error", error);
        body.put("message", message);
        body.put("timestamp", Instant.now());
        return ResponseEntity.status(status).body(body);
    }
}
