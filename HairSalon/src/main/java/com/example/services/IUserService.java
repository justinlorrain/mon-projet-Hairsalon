package com.example.services;

import com.example.models.AppUser;
import com.example.models.dto.AppUserDto;


import org.springframework.http.ResponseEntity;

public interface IUserService {
    AppUserDto createUser(AppUser appUser);
    AppUserDto updateUser(AppUser appUser, Long userId);
    ResponseEntity<?> changePassword(Long id, String oldPass, String newPass);
    AppUserDto findByEmail(String email);
        AppUser getUserFromToken(String authorizationHeader);

}
