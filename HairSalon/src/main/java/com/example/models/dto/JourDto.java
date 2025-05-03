package com.example.models.dto;



import lombok.Getter;
import lombok.Setter;

import java.sql.Date;
import java.sql.Time;


@Getter @Setter
public class JourDto {

    private Long id;
    private Long jourFerieId;
 

    private Date dateDuJour;
    private Time heureDebut;
    private Time heureFin;
    private String typeDeJour;
    private EmployeDto employeDto;

}
