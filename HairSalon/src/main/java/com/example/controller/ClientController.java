package com.example.controller;

import com.example.models.AppClient;
import com.example.models.AppService;
import com.example.models.dto.ClientDto;
import com.example.models.dto.PlanningJourDto;
import com.example.models.dto.RendezVousDto;
import com.example.security.UserPrincipal;
import com.example.services.servicesImpl.ClientServiceImpl;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

@RestController
@Tag(name = "client")
public class ClientController {

    private final ClientServiceImpl clientService;

    @Autowired
    public ClientController(ClientServiceImpl clientService1) {
        this.clientService = clientService1;
    }

    @PostMapping(value = "/client/create")
    public ClientDto createUser(@RequestBody AppClient client) {
        return this.clientService.create(client);
    }

    @PostMapping("/client/prendre-rendez-vous")
    public ResponseEntity<?> prendreUnRendezVous(@RequestBody Map<String, Object> requestBody) {
        // Initialiser ObjectMapper
        ObjectMapper objectMapper = new ObjectMapper();
        RendezVousDto rendezVous = objectMapper.convertValue(requestBody.get("rendezVous"), RendezVousDto.class);
        List<Long> servicesId = objectMapper.convertValue(requestBody.get("servicesId"), new TypeReference<List<Long>>() {
        });

        return this.clientService.makeAnAppointment(rendezVous, servicesId);
    }

    @PutMapping("/client/deplacer-rendez-vous/{id}/{newDate}/{newHour}")
    public ResponseEntity<?> deplacerRendezVous(
            @PathVariable("id") Long rendezVousId,
            @PathVariable("newDate") String nouvelleDate,
            @PathVariable("newHour") String nouvelleHeure) {
        return this.clientService.deplacerRendezVous(rendezVousId, nouvelleDate, nouvelleHeure);
    }

    @DeleteMapping("/client/annuler-rendez-vous/{id}")
    public ResponseEntity<?> annulerRendezVous(@PathVariable("id") Long rendezVousId) {
        return this.clientService.annulerRendezVous(rendezVousId);
    }

   @GetMapping("/client/voir-planning")
public List<RendezVousDto> voirPlanning(@AuthenticationPrincipal UserPrincipal userPrincipal) {
    Long clientId = userPrincipal.getId(); // 👈 ID du client connecté
    return clientService.voirPlanning(clientId);
}

    @PatchMapping("/client/update/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody ClientDto clientDto) {
        return ResponseEntity.ok(clientService.updateUser(id, clientDto));
    }

    @GetMapping("/client/mes-rendez-vous")
public List<RendezVousDto> voirMesRendezVous(@AuthenticationPrincipal UserPrincipal userPrincipal) {
    Long clientId = userPrincipal.getId();  // ID récupéré directement du token
    return clientService.getAllClientRendezVous(clientId);
}


    @GetMapping("/client/{clientId}")
    public ClientDto getClientById(@PathVariable Long clientId) {
        return clientService.getClientById(clientId);
    }

    @GetMapping("/client/{email}")
    public ClientDto getClientByEmail(@PathVariable String email) {
        return clientService.getClientByEmail(email);
    }

    @GetMapping("/client/get-rendez-vous/{id}")
    public RendezVousDto getClientRendezVous(@PathVariable Long id) {
        return clientService.getClientRendezVous(id);
    }
    
     @GetMapping("/services")
    public List<AppService> getAllServices() {
        return clientService.getAllServices();
    }
     @GetMapping("/client/planning-global")
public List<PlanningJourDto> getPlanningMensuel(
    @AuthenticationPrincipal UserPrincipal userPrincipal,
    @RequestParam("mois") int mois,
    @RequestParam("annee") int annee) {
    return clientService.getPlanningMensuel(userPrincipal.getId(), mois, annee);
}


}
