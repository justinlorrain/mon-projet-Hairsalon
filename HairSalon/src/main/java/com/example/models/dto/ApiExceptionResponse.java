package com.example.models.dto;

import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class ApiExceptionResponse {
    private int statutCode;
    private String data;

    public ApiExceptionResponse(int statutCode, String data) {
        this.statutCode = statutCode;
        this.data = data;
    }

}
