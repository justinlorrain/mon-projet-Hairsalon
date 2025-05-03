package com.example.models.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Setter
@AllArgsConstructor @Getter @NoArgsConstructor
public class JwtResponse {
    private Long id ;
    private String token;
    private String type = "Bearer";
    private String refreshToken;
    private String username;
    private String email;
    private String role;
}
