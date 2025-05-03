package com.example.exception;


import com.example.models.dto.ApiExceptionResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;


@ControllerAdvice
public class GlobalExceptionHandler {

    // Gérer les exceptions globales
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiExceptionResponse> handleGlobalException(Exception ex, WebRequest request) {
        HttpStatus status = getHttpStatusForException(ex);
        ApiExceptionResponse response = new ApiExceptionResponse(status.value(), ex.getMessage());
        return new ResponseEntity<>(response, status);
    }

    private HttpStatus getHttpStatusForException(Exception ex) {
        if (ex instanceof BadRequestException) {
            return HttpStatus.BAD_REQUEST;
        } else if (ex instanceof UnAuthorizedRequestException) {
            return HttpStatus.UNAUTHORIZED;
        }
        else if (ex instanceof AccessDeniedException) {
            return HttpStatus.FORBIDDEN;
        } else if (ex instanceof HttpRequestMethodNotSupportedException) {
            return HttpStatus.METHOD_NOT_ALLOWED;
        } else if (ex instanceof NotFoundException) {
            return HttpStatus.NOT_FOUND;
        } else {
            return HttpStatus.INTERNAL_SERVER_ERROR; // Par défaut
        }
    }


}
