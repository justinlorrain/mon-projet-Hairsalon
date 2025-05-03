/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.example.models.dto;

import java.util.ArrayList;
import java.util.List;
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
public class PlanningJourDto {
    private String date; // format "yyyy-MM-dd"
    private String typeDeJour; // T, FH, JF, etc.
    private Long employeId;
    private String employeNom;
  private String commentaire;

    private List<SlotDto> rendezVous = new ArrayList<>();
}