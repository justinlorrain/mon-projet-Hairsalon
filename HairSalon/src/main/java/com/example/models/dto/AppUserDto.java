package com.example.models.dto;


import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class AppUserDto {
    private Long id;
    private String nom;
    private String prenom;
    private String email;
    private String motDePasse;
    private String numeroTelephone;
    private String role;

}

