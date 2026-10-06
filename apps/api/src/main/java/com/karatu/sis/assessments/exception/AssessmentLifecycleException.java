package com.karatu.sis.assessments.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class AssessmentLifecycleException extends RuntimeException {
    public AssessmentLifecycleException(String message) {
        super(message);
    }
}
