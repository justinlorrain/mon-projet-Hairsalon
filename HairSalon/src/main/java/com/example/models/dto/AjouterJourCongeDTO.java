/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.example.models.dto;

import com.example.models.TypeDeJour;
import java.sql.Date;
import lombok.Getter;
import lombok.Setter;

/**
 *
 * @author justi
 */
@Getter
@Setter
public class AjouterJourCongeDTO {
    private Long employeId;
    private Date date;
    private TypeDeJour typeDeJour;
    
}
