package com.example.controller;

import com.example.exception.BadRequestException;
import com.example.exception.NotFoundException;
import com.example.models.AppClient;

import com.example.models.Employe;
import com.example.models.Facture;
import com.example.models.Jour;
import com.example.models.RendezVous;
import com.example.models.ServiceRendezVous;
import com.example.models.TypeDeJour;
import com.example.models.dto.ApiExceptionResponse;
import com.example.models.dto.ApiResponse;
import com.example.models.dto.ClientDto;
import com.example.models.dto.EmployeDto;
import com.example.models.dto.JourDto;
import com.example.models.dto.PlanningJourDto;
import com.example.models.dto.RendezVousDto;
import com.example.repositories.FactureRepository;
import com.example.repositories.JourFerieRepository;
import com.example.repositories.JoursFermetureReguliersRepository;
import com.example.repositories.ServiceRendezVousRepository;
import com.example.security.UserPrincipal;
import com.example.services.servicesImpl.EmployeeServiceImpl;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.persistence.criteria.Path;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.sql.Date;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpHeaders;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

@RestController
@Tag(name = "/employe/")
public class EmployeController {

    private final EmployeeServiceImpl employeeService;
     private final JoursFermetureReguliersRepository fermetureRepository;
    private final JourFerieRepository jourFerieRepository;
     private final  FactureRepository factureRepository ;
 private final ServiceRendezVousRepository serviceRendezVousRepository;
    @Autowired
    public EmployeController(EmployeeServiceImpl service,FactureRepository factureRepository,ServiceRendezVousRepository serviceRendezVousRepository,JoursFermetureReguliersRepository fermetureRepository,JourFerieRepository jourFerieRepository) {
        this.employeeService = service;
        this.fermetureRepository = fermetureRepository;
        this.jourFerieRepository = jourFerieRepository ;
        this.factureRepository = factureRepository ;
        this.serviceRendezVousRepository =serviceRendezVousRepository;
    }

    @PostMapping(value = "/employe/create")
    public ResponseEntity<?> createUser(@RequestBody Employe employe) {
        return this.employeeService.createEmployee(employe);
    }
    
  @PostMapping("/employe/prendre-rendez-vous-client-sans-compte")
public ResponseEntity<?> prendreRvClientSansCompte(@RequestBody Map<String, Object> requestBody) {
    ObjectMapper mapper = new ObjectMapper();

    // 1. Extraire le client DTO
    ClientDto clientDto = mapper.convertValue(requestBody.get("client"), ClientDto.class);

    // 2. Extraire le rendez-vous DTO
    RendezVousDto rendezVous = mapper.convertValue(requestBody.get("rendezVous"), RendezVousDto.class);

    // 3. Extraire les services
    List<Long> servicesId = mapper.convertValue(requestBody.get("servicesId"), new TypeReference<List<Long>>() {});

    // 4. Appel au service employé
    return employeeService.prendreRendezVousPourClientSansCompte(clientDto, rendezVous, servicesId);
}



    @PutMapping(value = "/employe/update/{id}")
    public ResponseEntity<?> updateUser(@RequestBody Employe employe, @PathVariable("id") Long userId) {
        return this.employeeService.updateEmployee(employe, userId);
    }

    @PostMapping("/employe/prendre-rendez-vous")
    public ResponseEntity<?> prendreUnRendezVous(@RequestBody Map<String, Object> requestBody) {
        // Initialiser ObjectMapper
        ObjectMapper objectMapper = new ObjectMapper();
        RendezVousDto rendezVous = objectMapper.convertValue(requestBody.get("rendezVous"), RendezVousDto.class);
        List<Long> servicesId = objectMapper.convertValue(requestBody.get("servicesId"), new TypeReference<List<Long>>() {
        });

        return this.employeeService.prendreRendezVous(rendezVous, servicesId);
    }

    @PutMapping("/employe/deplacer-rendez-vous/{id}")
    public ResponseEntity<?> deplacerRendezVous(
            @PathVariable("id") Long rendezVousId,
            @RequestBody Map<String, String> requestBody) {

        String nouvelleDate = requestBody.get("nouvelleDate");
        String nouvelleHeure = requestBody.get("nouvelleHeure");

        return this.employeeService.deplacerRendezVous(rendezVousId, nouvelleDate, nouvelleHeure);
    }

   @DeleteMapping("/employe/annuler-rendez-vous/{id}")
    public ResponseEntity<?> annulerRendezVous(@PathVariable("id") Long rendezVousId) {
        return this.employeeService.annulerRendezVous(rendezVousId);
    }

    @GetMapping("/employe/get-all-rendez-vous/{id}")
    public List<RendezVousDto> getAllEmployeRendezVous(@PathVariable("id") Long rendezVousId) {
        return this.employeeService.getEmployeeRendezVous(rendezVousId);
    }

    @GetMapping("/employe/tous-les-rendez-vous")
    public List<RendezVousDto> tousLesRendezVous() {
        return this.employeeService.getRendezVousList();
    }

   @PostMapping("/employe/facture/{factureId}/payer")
public ResponseEntity<?> payerFacture(@PathVariable Long factureId) {
    Facture facture = factureRepository.findById(factureId)
        .orElseThrow(() -> new NotFoundException("Facture introuvable"));

    if (facture.isEstPayee()) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(new ApiExceptionResponse(400, "Cette facture est déjà payée."));
    }

    facture.setEstPayee(true);
    factureRepository.save(facture);

    return ResponseEntity.ok(new ApiResponse<>(200, "✅ Paiement confirmé."));
}
@PostMapping("/employe/create-facture/{rendezVousId}/{employeId}")
    public ResponseEntity<?> createFacture(@PathVariable Long rendezVousId, @PathVariable Long employeId) {
        return employeeService.createFacture(rendezVousId, employeId);
    }
    
    @GetMapping("/factures/{id}/regenerer")
public ResponseEntity<?> regenererFacturePdf(@PathVariable Long id) {
    try {
        // 1️⃣ Charger la facture, le RDV et le client
        Facture facture = factureRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Facture non trouvée"));

        RendezVous rdv = facture.getRendezVous();
        AppClient client = rdv.getClient();
        List<ServiceRendezVous> services = employeeService.getServicesByRendezVous(rdv);

        // 2️⃣ Générer le PDF
        byte[] pdfBytes = employeeService.genererFacturePdf(facture, client, services,rdv);
        if (pdfBytes == null) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("❌ Échec de la génération du PDF");
        }

        // 3️⃣ Sauvegarder dans le dossier
        java.nio.file.Path path = java.nio.file.Paths.get("factures/facture_" + facture.getId() + ".pdf");
        Files.createDirectories(path.getParent());
        Files.write(path, pdfBytes);

        return ResponseEntity.ok("✅ PDF régénéré pour la facture " + id);
    } catch (Exception e) {
        e.printStackTrace();
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("❌ Erreur lors de la régénération du PDF : " + e.getMessage());
    }
}

@GetMapping("/factures/{id}/download")
public ResponseEntity<?> downloadFacture(@PathVariable Long id) {
    try {
        java.nio.file.Path path = Paths.get("factures/facture_" + id + ".pdf");
        if (!Files.exists(path)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("❌ Facture non trouvée pour l'ID " + id);
        }

        byte[] pdfBytes = Files.readAllBytes(path);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=facture_" + id + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);

    } catch (IOException e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("❌ Erreur lors du téléchargement de la facture");
    }
}

 

    @PostMapping("/employe/generer")
    public ResponseEntity<?> genererCalendrierAnnuel() {
        employeeService.genererCalendrierAnnuel(LocalDate.now());
        return ResponseEntity.ok("Calendrier généré pour l'année à venir");
    }
    
   /* @PostMapping("/employe/calendrier/regenerer")
public ResponseEntity<?> regenererCalendrierDepuisAujourdhui() {
    employeeService.genererCalendrierAnnuel(LocalDate.now());
    return ResponseEntity.ok("✅ Calendrier régénéré !");
}*/

 @GetMapping("/employes/planning-global")
public List<PlanningJourDto> getPlanningMensuel(
    @AuthenticationPrincipal UserPrincipal userPrincipal,
    @RequestParam("mois") int mois,
    @RequestParam("annee") int annee) {
    return employeeService.getPlanningMensuel(mois, annee);
}


    
    
    @GetMapping("/employe/calendrier")
public ResponseEntity<List<JourDto>> getCalendrier() {
    List<JourDto> calendrier = employeeService.getCalendrier();
    return ResponseEntity.ok(calendrier);
}

@PostMapping("/jours-fermeture-reguliers")
public ResponseEntity<?> ajouterJourFermeture(@RequestBody Map<String, String> body) {
    return employeeService.ajouterJourFermeture(body.get("jourDeLaSemaine"));
}

@DeleteMapping("/jours-fermeture-reguliers/tous")
public ResponseEntity<?> supprimerTousLesJoursFermeture() {
    employeeService.supprimerTousLesJoursFermeture(); // appelle le service transactionnel
    return ResponseEntity.ok(new ApiResponse<>(200, "✅ Tous les jours de fermeture supprimés"));
}

@GetMapping("/jours-fermeture-reguliers")
public ResponseEntity<?> getJoursFermeture() {
    return ResponseEntity.ok(fermetureRepository.findAll());
}


    @PostMapping("/employe/ajouter-jour-ferie")
public ResponseEntity<?> ajouterJourFerie(@RequestBody Map<String, String> request) {
    LocalDate date = LocalDate.parse(request.get("date"));
    employeeService.ajouterJourFerie(date);
    return ResponseEntity.ok("✅ Jour férié ajouté avec succès !");
}


@PostMapping("/ajouter-jour-conge")
public ResponseEntity<?> ajouterJourConge(@RequestBody Map<String, Object> request) {
    try {
        // ✅ Vérifier chaque champ
        if (request.get("employeId") == null || request.get("date") == null || request.get("typeDeJour") == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiExceptionResponse(400, "❌ Champs manquants : employeId, date ou typeDeJour"));
        }

        Long employeId = Long.valueOf(request.get("employeId").toString());
        Date dateConverted = Date.valueOf(request.get("date").toString());
        TypeDeJour typeDeJourConverted = TypeDeJour.valueOf(request.get("typeDeJour").toString().trim().toUpperCase());

        // Facultatif : "matin" (par défaut à false si non fourni)
        boolean matin = false;
        if (request.containsKey("matin") && request.get("matin") != null) {
            matin = Boolean.parseBoolean(request.get("matin").toString());
        }

        return employeeService.ajouterJourConge(employeId, dateConverted, typeDeJourConverted, matin);

    } catch (IllegalArgumentException e) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ApiExceptionResponse(400, "❌ Type de jour invalide : " + request.get("typeDeJour")));
    } catch (Exception e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiExceptionResponse(500, "❌ Une erreur est survenue : " + e.getMessage()));
    }
}




    @DeleteMapping("/employe/supprimer-jour-ferie/{jourId}")
    public ResponseEntity<?> supprimerJourFerie(@PathVariable Long jourId) {
        employeeService.supprimerJourFerie(jourId);
        return ResponseEntity.ok("Jour ferié supprimé");
    }

    @DeleteMapping("/employe/supprimer-jour-conge/{jourId}")
public ResponseEntity<?> supprimerJourConge(@PathVariable Long jourId) {
    try {
        employeeService.supprimerJourConge(jourId);
        return ResponseEntity.ok("✅ Jour de congé supprimé ou converti en jour de travail !");
    } catch (BadRequestException e) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
    } catch (NotFoundException e) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
    } catch (Exception e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("❌ Une erreur est survenue : " + e.getMessage());
    }
}


@PutMapping("/employe/modifier-horaire-employe/{employeId}")
public ResponseEntity<?> modifierHoraire(
        @PathVariable Long employeId,
        @RequestBody List<Jour> joursModifies
) {
    return employeeService.modifierHoraire(employeId, joursModifies);
}


    @GetMapping("/employe/id/{employeId}")
    public EmployeDto getEmployeById(@PathVariable Long employeId) {
        return employeeService.employeDetailParId(employeId);
    }

    @GetMapping("/employe/email/{email}")
    public EmployeDto getEmployeByEmail(@PathVariable String email) {
        return employeeService.employeDetailParEmail(email);
    }

    @GetMapping("/employe/get-all-jour/{id}")
    public List<JourDto> getEmployeJour(@PathVariable Long id) {
        return employeeService.getJourEmploye(id);
    }

    @GetMapping("/employe/get-all")
    public List<EmployeDto> getAllEmployes() {
        return employeeService.getAllEmploye();
    }
  
@GetMapping("/client/by-phone/{tel}")
public ResponseEntity<?> getClientByTelephone(@PathVariable String tel) {
    AppClient client = employeeService.getClientByTelephone(tel);
    if (client == null) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Client introuvable");
    }
    return ResponseEntity.ok(new ClientDto(client.getNom(), client.getPrenom(), client.getEmail(), client.getNumeroTelephone()));
}

@GetMapping("/client/search")
public ResponseEntity<?> searchClientByQuery(@RequestParam("query") String query) {
    List<ClientDto> clients = employeeService.searchClients(query);
    return ResponseEntity.ok(clients);
}


}
