package com.example.services;

import com.example.models.AppClient;
import com.example.models.AppUser;
import com.example.models.Employe;

import org.springframework.http.ResponseEntity;

public interface IAuthService {
    ResponseEntity<?> authenticateUser(AppUser appUser);
    ResponseEntity<?> registerUser(AppClient appClient);
    
}
