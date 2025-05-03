/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.example.config;

/**
 *
 * @author justi
 */
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:3000","http://localhost:5173")  // autoriser cette origine
                .allowedMethods("GET", "POST", "PUT", "DELETE","PATCH", "OPTIONS")  // autoriser les méthodes HTTP
                .allowedHeaders("*")  // autoriser tous les headers
                .allowCredentials(true);  // autoriser l'envoi de cookies (si nécessaire)
    }
}
