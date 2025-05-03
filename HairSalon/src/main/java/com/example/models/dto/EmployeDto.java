package com.example.models.dto;


import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.Set;

@Getter @Setter
public class EmployeDto extends AppUserDto {

    private Set<RendezVousDto> rendezVousDtos;
    private List<JourDto> planningDto;

}
