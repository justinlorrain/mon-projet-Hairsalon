package com.example.services;

import com.example.models.AppClient;
import com.example.models.Employe;
import com.example.models.Jour;
import com.example.models.TypeDeJour;
import com.example.models.dto.ClientDto;
import com.example.models.dto.EmployeDto;
import com.example.models.dto.JourDto;
import com.example.models.dto.PlanningJourDto;
import com.example.models.dto.RendezVousDto;

import org.springframework.http.ResponseEntity;

import java.time.LocalDate;
import java.sql.Date;
import java.util.List;

public interface IEmployeeService {
    ResponseEntity<?> createEmployee(Employe employe);
    ResponseEntity<?> updateEmployee(Employe employe, Long id);
    ResponseEntity<?> prendreRendezVous(RendezVousDto rendezVousDto, List<Long> serviceIds);
    ResponseEntity<?> deplacerRendezVous(Long rendezVousId, String nouvelleDate, String nouvelleHeure);
    ResponseEntity<?> annulerRendezVous(Long rendezVousId);
    List<RendezVousDto> getRendezVousList();
    ResponseEntity<?> createFacture(Long rendezVousId, Long employeeId);
    /*ResponseEntity<?> modifierHoraire(Long employeeId, Jour jour);*/
    void genererCalendrierAnnuel(LocalDate startDate);
    
    ResponseEntity<?> ajouterJourConge(Long employeId, Date date, TypeDeJour typeDeJour, boolean matin);
   /* ResponseEntity<?> ajouterJourTravail(Long employeId, Date date);*/
    void supprimerJourConge(Long jourId);
    EmployeDto employeDetailParId(Long employeId);
    EmployeDto employeDetailParEmail(String email);
    List<RendezVousDto> getEmployeeRendezVous(Long employeId);
    List<JourDto> getJourEmploye(Long employeId);
    List<EmployeDto> getAllEmploye();
        List<JourDto> getCalendrier();  // Ajoutez cette ligne
        
        ResponseEntity<?> prendreRendezVousPourClientSansCompte(ClientDto clientDto, RendezVousDto rendezVousDto, List<Long> serviceIds);
// IEmployeService.java
/*List<PlanningJourDto> getPlanningGlobal(Long clientId);*/
List<PlanningJourDto> getPlanningMensuel( int mois, int annee);

 ResponseEntity<?> modifierHoraire(Long employeId, List<Jour> joursModifies);

ResponseEntity<?> ajouterJourFermeture(String jour);
ResponseEntity<?> supprimerJourFermeture(String jour);
void supprimerTousLesJoursFermeture();
void supprimerJourFerie(Long jourFerieId);

AppClient getClientByTelephone(String tel);

/*List<ClientDto> searchClients(String nom, String prenom);*/
List<ClientDto> searchClients(String query);

 }
