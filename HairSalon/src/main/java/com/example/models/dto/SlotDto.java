/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.example.models.dto;

import java.sql.Time;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 *
 * @author justi
 */
@Getter @Setter
@AllArgsConstructor
@NoArgsConstructor
public class SlotDto {
    private String heure;
    private String heureFin;
    private Time duree;
    private String serviceNom;
    private boolean estProprietaire; // true si ce slot est celui du client connecté
    private String clientNom;
    private String clientPrenom;
    private String clientEmail;
    private String clientTel;
}
