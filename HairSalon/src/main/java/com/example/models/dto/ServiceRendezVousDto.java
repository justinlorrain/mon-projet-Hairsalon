package com.example.models.dto;


import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class ServiceRendezVousDto {
    private Long id;
   @JsonIgnoreProperties("serviceRendezVousDtos")
    private RendezVousDto rendezVousDto;
    private AppServiceDto servicesDto;
    
    
}
