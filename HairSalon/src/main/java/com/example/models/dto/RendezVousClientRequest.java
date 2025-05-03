/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.example.models.dto;

import java.util.List;
import lombok.Getter;
import lombok.Setter;

/**
 *
 * @author justi
 */
@Getter @Setter
public class RendezVousClientRequest {
    private ClientDto clientDto;
    private RendezVousDto rendezVousDto;
    private List<Long> serviceIds;
}
