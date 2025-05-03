package com.example.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.UNAUTHORIZED)
public class UnAuthorizedRequestException extends RuntimeException {

    private static final long serialVersionUID = 1L;
    public UnAuthorizedRequestException(String message) {
        super(message);
    }
}
