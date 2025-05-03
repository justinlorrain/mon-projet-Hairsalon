package com.example.services;

import com.example.models.AppClient;
import com.example.models.AppService;
import com.example.models.dto.ClientDto;
import com.example.models.dto.PlanningJourDto;
import com.example.models.dto.RendezVousDto;

import org.springframework.http.ResponseEntity;


import java.util.List;

public interface IClientService {
    ResponseEntity<?> makeAnAppointment(RendezVousDto rendezVousDto, List<Long> serviceIds);
    ResponseEntity<?> deplacerRendezVous(Long rendezVousId, String nouvelleDate, String nouvelleHeure);
    ResponseEntity<?> annulerRendezVous(Long rendezVousId);
    List<RendezVousDto> getRendezVousList();
    ClientDto create(AppClient client);
    ClientDto getClientById(Long clientId);
    ClientDto getClientByEmail(String email);
    RendezVousDto getClientRendezVous(Long clientId);
    List<RendezVousDto> getAllClientRendezVous(Long clientId);
    List<ClientDto> getAllClients();
        List<AppService> getAllServices();
        List<PlanningJourDto> getPlanningMensuel(Long clientId, int mois, int annee);

}
