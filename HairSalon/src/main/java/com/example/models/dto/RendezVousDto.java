package com.example.models.dto;



import com.fasterxml.jackson.annotation.JsonInclude;

import lombok.Getter;
import lombok.Setter;

import java.sql.Date;
import java.sql.Time;
import java.util.Set;

@Getter @Setter
@JsonInclude(JsonInclude.Include.NON_NULL)
public class RendezVousDto {
    private Long id;
    private Date date;
    private Time heure;
    private Time duree;
    private String nomClient;
    private String numeroTelephoneClient;
    private ClientDto clientDto;
    private EmployeDto employeDto;
    private Set<ServiceRendezVousDto> serviceRendezVousDtos;
     private boolean factureCreee;
     private Long factureId;
private Boolean estPayee;

}
