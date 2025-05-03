/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.example.models.dto;

import java.sql.Date;
import java.util.List;
import lombok.Getter;
import lombok.Setter;

/**
 *
 * @author justi
 */
@Getter @Setter
public class FactureDto {
    private Long id;
    private Date date;
    private Double montant;
    private boolean estPayee;
    private Long rendezVousId;
    private String clientNom;
    private String clientEmail;
    private List<String> services;
}
