package com.example.services.servicesImpl;

import com.example.exception.BadRequestException;
import com.example.exception.NotFoundException;

import com.example.models.AppClient;
import com.example.models.AppService;
import com.example.models.Employe;
import com.example.models.Jour;
import com.example.models.Facture;

import com.example.models.RendezVous;
import com.example.models.ServiceRendezVous;
import com.example.models.TypeDeJour;
import com.example.models.dto.ApiExceptionResponse;
import com.example.models.dto.ApiResponse;
import com.example.models.dto.AppServiceDto;
import com.example.models.dto.ClientDto;
import com.example.models.dto.EmployeDto;
import com.example.models.dto.PlanningJourDto;
import com.example.models.dto.RendezVousDto;
import com.example.models.dto.ServiceRendezVousDto;
import com.example.models.dto.SlotDto;
import com.example.repositories.ClientRepository;
import com.example.repositories.EmployeRepository;
import com.example.repositories.JourFerieRepository;
import com.example.repositories.JourRepository;
import com.example.repositories.RendezVousRepository;
import com.example.repositories.ServiceRendezVousRepository;
import com.example.repositories.ServiceRepository;
import com.example.repositories.FactureRepository;
import com.example.repositories.JoursFermetureReguliersRepository;

import com.example.services.IClientService;
import com.example.services.MailService;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.sql.Time;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.time.DayOfWeek;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;

import java.time.LocalTime;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.integration.IntegrationProperties.RSocket.Client;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ClientServiceImpl implements IClientService {

    private ClientRepository clientRepository;
    private RendezVousRepository rendezVousRepository;
    private ServiceRendezVousRepository serviceRendezVousRepository;
    private JourRepository jourRepository;
    private ModelMapper modelMapper;
    private MailService mailService;
    private EmployeRepository employeRepository;
    private PasswordEncoder passwordEncoder;
    private JourFerieRepository jourFerieRepository;
    private final ServiceRepository serviceRepository;
    private final JoursFermetureReguliersRepository joursFermetureReguliersRepository ;
   @Autowired
private FactureRepository factureRepository;

    @Autowired
    public ClientServiceImpl(JourFerieRepository jourFerieRepository,JoursFermetureReguliersRepository joursFermetureReguliersRepository, MailService mailService, ClientRepository clientRepository, PasswordEncoder passwordEncoder, EmployeRepository employeRepository, JourRepository jourRepository, RendezVousRepository rendezVousRepository, ServiceRendezVousRepository serviceRendezVousRepository, ModelMapper modelMapper, ServiceRepository serviceRepository) {
        this.clientRepository = clientRepository;
        this.rendezVousRepository = rendezVousRepository;
        this.serviceRendezVousRepository = serviceRendezVousRepository;
        this.employeRepository = employeRepository;
        this.modelMapper = modelMapper;
        this.mailService = mailService;
        this.passwordEncoder = passwordEncoder;
        this.jourRepository = jourRepository;
        this.serviceRepository = serviceRepository;
        this.jourFerieRepository = jourFerieRepository;
        this.joursFermetureReguliersRepository = joursFermetureReguliersRepository;
       
    }

@Override
public ResponseEntity<?> makeAnAppointment(RendezVousDto rendezVousDto, List<Long> serviceIds) {
    Employe employe = employeRepository.findById(rendezVousDto.getEmployeDto().getId())
            .orElseThrow(() -> new NotFoundException("Employé non trouvé ID : " + rendezVousDto.getEmployeDto().getId()));

    LocalDate dateRdv = rendezVousDto.getDate().toLocalDate();
    java.sql.Date sqlDateRdv = java.sql.Date.valueOf(dateRdv);
    
  // 🔁 Récupérer les jours de fermeture réguliers depuis la base
List<DayOfWeek> joursFermes = joursFermetureReguliersRepository.findAll().stream()
        .map(j -> convertirEnDayOfWeek(j.getJourDeLaSemaine()))
        .collect(Collectors.toList());

// 📅 Récupérer les jours fériés ponctuels
List<LocalDate> joursFeries = jourFerieRepository.findAll().stream()
        .map(jf -> jf.getDate().toLocalDate())
        .collect(Collectors.toList());

// 🔢 Calcul de la date limite à 14 jours ouvrables (hors fériés et jours fermés)
int joursOuvrables = 0;
LocalDate cursor = LocalDate.now();

while (joursOuvrables < 14) {
    cursor = cursor.plusDays(1);
    DayOfWeek jour = cursor.getDayOfWeek();

    boolean estFerie = joursFeries.contains(cursor);
    boolean estFermeture = joursFermes.contains(jour);

    if (!estFermeture && !estFerie) {
        joursOuvrables++;
    }
}

// ❌ Refus si la date du rendez-vous dépasse la limite
if (dateRdv.isAfter(cursor)) {
    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(new ApiExceptionResponse(
                    400,
                    "⚠️ Vous ne pouvez enregistrer un rendez-vous que dans les 14 jours ouvrables à venir (hors jours fériés et jours de fermeture réguliers)."
            ));
}


    
    // ✅ Vérification de la période couverte par le calendrier
LocalDate now = LocalDate.now();
LocalDate dateLimite = LocalDate.of(now.getYear() + 1, 12, 31);

if (dateRdv.isAfter(dateLimite)) {
    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(new ApiExceptionResponse(400, "📅 Le planning pour cette période n’est pas encore disponible. Revenez plus tard 😊"));
}


    if (sqlDateRdv.before(new java.sql.Date(System.currentTimeMillis()))) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ApiExceptionResponse(400, "❌ Impossible de prendre un rendez-vous dans le passé !"));
    }

    Time heureRdv = rendezVousDto.getHeure();
    Time dureeRdv = rendezVousDto.getDuree();
    LocalTime heureRdvLocal = heureRdv.toLocalTime();

    Optional<Jour> jourTravailOpt = jourRepository.findFirstByDateDuJourAndEmployeAndTypeDeJourIn(
            sqlDateRdv,
            employe,
            List.of(TypeDeJour.T, TypeDeJour.DC, TypeDeJour.JC)
    );

    if (jourTravailOpt.isEmpty()) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ApiExceptionResponse(400, "⚠️ L'employé ne travaille pas ce jour-là !"));
    }

    Jour jourTravail = jourTravailOpt.get();
    LocalTime heureDebutTravail;
    LocalTime heureFinTravail;

    LocalTime heureDebutBrut = jourTravail.getHeureDebut().toLocalTime();
    LocalTime heureFinBrut = jourTravail.getHeureFin().toLocalTime();

    if (jourTravail.getTypeDeJour() == TypeDeJour.T) {
        heureDebutTravail = heureDebutBrut;
        heureFinTravail = heureFinBrut;
    } else if (jourTravail.getTypeDeJour() == TypeDeJour.DC) {
        if (heureDebutBrut.equals(LocalTime.of(9, 0)) && heureFinBrut.equals(LocalTime.of(13, 30))) {
            heureDebutTravail = LocalTime.of(13, 30); // travaille l'après-midi
            heureFinTravail = LocalTime.of(18, 0);
        } else if (heureDebutBrut.equals(LocalTime.of(13, 30)) && heureFinBrut.equals(LocalTime.of(18, 0))) {
            heureDebutTravail = LocalTime.of(9, 0); // travaille le matin
            heureFinTravail = LocalTime.of(13, 30);
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiExceptionResponse(400, "⚠️ Configuration invalide de la plage horaire pour un congé partiel."));
        }
    } else {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ApiExceptionResponse(400, "⚠️ L'employé est en congé toute la journée."));
    }

    LocalTime heureFinRdvLocal = heureRdvLocal.plusMinutes(
            dureeRdv.toLocalTime().getHour() * 60 + dureeRdv.toLocalTime().getMinute()
    );

    // 🔥 Affichage d'un message personnalisé si rendez-vous en dehors des heures autorisées
    if (heureRdvLocal.isBefore(heureDebutTravail) || heureFinRdvLocal.isAfter(heureFinTravail)) {
        String message;
        if (jourTravail.getTypeDeJour() == TypeDeJour.DC) {
            if (heureDebutTravail.equals(LocalTime.of(13, 30))) {
                message = "⚠️ L'employé est en congé le matin (09:00 à 13:30).";
            } else {
                message = "⚠️ L'employé est en congé l'après-midi (13:30 à 18:00).";
            }
        } else {
            message = "⚠️ L'heure du rendez-vous est en dehors des horaires de travail !";
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ApiExceptionResponse(400, message));
    }

    if (!isEmployeDisponible(employe, sqlDateRdv, heureRdv, dureeRdv)) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ApiExceptionResponse(400, "⚠️ L'employé est déjà occupé à cette heure !"));
    }

    if (rendezVousDto.getClientDto() == null || rendezVousDto.getClientDto().getId() == null) {
        throw new BadRequestException("❌ Le client est invalide ou manquant !");
    }

    AppClient client = clientRepository.findById(rendezVousDto.getClientDto().getId())
            .orElseThrow(() -> new NotFoundException("❌ Client non trouvé ID : " + rendezVousDto.getClientDto().getId()));

    if (!isClientDisponible(client, sqlDateRdv, heureRdv, dureeRdv)) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ApiExceptionResponse(400, "⚠️ Le client est déjà occupé à cette heure !"));
    }

    RendezVous rendezVous = new RendezVous();
    rendezVous.setDuree(dureeRdv);
    rendezVous.setDate(sqlDateRdv);
    rendezVous.setHeure(heureRdv);
    rendezVous.setEmploye(employe);
    rendezVous.setClient(client);
    rendezVous = rendezVousRepository.save(rendezVous);

    if (serviceIds == null || serviceIds.isEmpty()) {
        throw new BadRequestException("Erreur : La liste des services est vide ou null !");
    }

    for (Long serviceId : serviceIds) {
        ServiceRendezVous serviceRendezVous = new ServiceRendezVous();
        serviceRendezVous.setRendezVous(rendezVous);
        AppService service = new AppService();
        service.setId(serviceId);
        serviceRendezVous.setServices(service);
        serviceRendezVousRepository.save(serviceRendezVous);
    }

    Time heureFinRdv = Time.valueOf(heureFinRdvLocal);
    if (heureRdv.equals(jourTravail.getHeureDebut())) {
        jourTravail.setHeureDebut(heureFinRdv);
    } else if (heureFinRdv.equals(jourTravail.getHeureFin())) {
        jourTravail.setHeureFin(heureRdv);
    }
    jourRepository.save(jourTravail);

    if (client.getEmail() != null) {
        String contenu = String.format("""
                Bonjour %s,
                Votre rendez-vous du %s à %s avec %s %s a bien été confirmé.
                ℹ️ Pour toute annulation, merci de nous prévenir au moins 24 heures à l’avance.
                Merci et à bientôt dans notre salon !
                L’équipe du salon
                """,
                client.getPrenom(),
                rendezVous.getDate().toString(),
                rendezVous.getHeure().toString().substring(0, 5),
                employe.getPrenom(),
                employe.getNom()
        );

        mailService.envoyerMail(client.getEmail(), "✅ Confirmation de votre rendez-vous", contenu);
    }

    return ResponseEntity.ok(new ApiResponse<>(200, "✅ Rendez-vous créé avec succès !"));
   
}

private DayOfWeek convertirEnDayOfWeek(String jourFr) {
    if (jourFr == null) {
        throw new IllegalArgumentException("Jour invalide : null");
    }

    return switch (jourFr.trim().toLowerCase()) {
        case "lundi" -> DayOfWeek.MONDAY;
        case "mardi" -> DayOfWeek.TUESDAY;
        case "mercredi" -> DayOfWeek.WEDNESDAY;
        case "jeudi" -> DayOfWeek.THURSDAY;
        case "vendredi" -> DayOfWeek.FRIDAY;
        case "samedi" -> DayOfWeek.SATURDAY;
        case "dimanche" -> DayOfWeek.SUNDAY;
        default -> throw new IllegalArgumentException("Jour invalide : " + jourFr);
    };
}



    @Override
    public ResponseEntity<?> deplacerRendezVous(Long rendezVousId, String nouvelleDate, String nouvelleHeure) {
        Logger logger = LoggerFactory.getLogger(getClass());

        Optional<RendezVous> rendezVousOpt = rendezVousRepository.findById(rendezVousId);
        if (rendezVousOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiExceptionResponse(404, "❌ Rendez-vous non trouvé"));
        }

        RendezVous rendezVous = rendezVousOpt.get();
        Employe employe = rendezVous.getEmploye();

        // 1⃣ Convertir la nouvelle date reçue
        SimpleDateFormat formatter = new SimpleDateFormat("dd-MM-yyyy");
        Date convertDate;
        try {
            convertDate = formatter.parse(nouvelleDate);
        } catch (ParseException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiExceptionResponse(400, "❌ Format de date invalide !"));
        }

        // 🔁 Conversion en types utiles
        java.sql.Date sqlConvertDate = new java.sql.Date(convertDate.getTime());
        LocalDate newLocalDate = sqlConvertDate.toLocalDate();

        Time newHour;
        try {
            newHour = Time.valueOf(nouvelleHeure);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiExceptionResponse(400, "❌ Format de l'heure invalide. Format attendu : HH:mm:ss"));
        }

        LocalDateTime now = LocalDateTime.now();
        LocalDate oldLocalDate = rendezVous.getDate().toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
        LocalTime oldTime = rendezVous.getHeure().toLocalTime();
        LocalDateTime ancienneDateTime = LocalDateTime.of(oldLocalDate, oldTime);

        // 2⃣ Vérifier que la date actuelle du RDV est au moins 24h plus tard
        if (ChronoUnit.HOURS.between(now, ancienneDateTime) < 24) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiExceptionResponse(400, "❌ Vous devez déplacer le rendez-vous au moins 24h à l'avance !"));
        }

        // 3⃣ Empêcher de déplacer dans le passé
        LocalDateTime newDateTime = LocalDateTime.of(newLocalDate, newHour.toLocalTime());
        if (newDateTime.isBefore(now)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiExceptionResponse(400, "❌ Impossible de déplacer un rendez-vous dans le passé !"));
        }

        // 4⃣ Jour férié ?
        if (jourFerieRepository.existsByDate(sqlConvertDate)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiExceptionResponse(400, "❌ Impossible de déplacer un rendez-vous sur un jour férié !"));
        }

        // 5⃣ Jour de fermeture (dimanche/lundi) ?
        DayOfWeek day = newLocalDate.getDayOfWeek();
        if (day == DayOfWeek.SUNDAY || day == DayOfWeek.MONDAY) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiExceptionResponse(400, "❌ Impossible de déplacer un rendez-vous sur un jour de fermeture !"));
        }

        // 6⃣ Vérifier que l'employé travaille ce jour-là
        Optional<Jour> jourTravailOpt = jourRepository.findFirstByDateDuJourAndEmployeAndTypeDeJour(
                sqlConvertDate, employe, TypeDeJour.T);
        if (jourTravailOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiExceptionResponse(400, "❌ L'employé ne travaille pas ce jour-là !"));
        }

        Jour jourTravail = jourTravailOpt.get();

        // 7⃣ Heure dans la plage horaire ?
        if (newHour.before(jourTravail.getHeureDebut()) || newHour.after(jourTravail.getHeureFin())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiExceptionResponse(400, "❌ L'heure est en dehors des horaires de travail !"));
        }

        // 8⃣ Vérifier chevauchement avec d'autres RDVs
        boolean chevauchement = rendezVousRepository.existsByClientOrEmployeAndDateAndChevauchement(
                rendezVous.getClient().getId(),
                employe.getId(),
                sqlConvertDate,
                newHour,
                rendezVous.getDuree(),
                rendezVousId
        );
        if (chevauchement) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiExceptionResponse(400, "❌ Ce créneau est déjà occupé par vous ou l'employé !"));
        }

        // ✅ Mettre à jour le rendez-vous
        rendezVous.setDate(sqlConvertDate);
        rendezVous.setHeure(newHour);
        rendezVousRepository.save(rendezVous);

        logger.info("✅ RDV déplacé avec succès : {} à {} pour l'employé {}", sqlConvertDate, newHour, employe.getId());

        return ResponseEntity.ok(new ApiResponse<>(200, "✅ Rendez-vous déplacé avec succès !"));
    }

    @Override
@Transactional
public ResponseEntity<?> annulerRendezVous(Long rendezVousId) {
    Logger logger = LoggerFactory.getLogger(getClass());

    Optional<RendezVous> rendezVousOpt = rendezVousRepository.findById(rendezVousId);
    if (rendezVousOpt.isEmpty()) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ApiExceptionResponse(404, "❌ Rendez-vous non trouvé"));
    }

    RendezVous rendezVous = rendezVousOpt.get();

    // 🟨 Déclaration préalable pour qu'elle soit utilisable dans toute la méthode
    Optional<Facture> factureOpt = Optional.empty();

    // 🟨 Vérification : facture payée ?
    try {
        factureOpt = factureRepository.findByRendezVous(rendezVous);
        if (factureOpt.isPresent() && factureOpt.get().isEstPayee()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new ApiExceptionResponse(409, "💳 Ce rendez-vous a déjà été payé. Veuillez contacter le salon pour l'annuler."));
        }
    } catch (Exception e) {
        logger.error("❌ Erreur lors de la vérification de la facture", e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiExceptionResponse(500, "❌ Erreur interne : vérification de la facture échouée."));
    }

    // 🕒 Maintenant
    LocalDateTime maintenant = LocalDateTime.now();
    logger.info("🕒 Maintenant: {}", maintenant);

    // 📅 Date & heure du rendez-vous
    Instant instant = rendezVous.getDate().toInstant();
    LocalDate dateRdv = instant.atZone(ZoneId.systemDefault()).toLocalDate();
    LocalTime heureRdv = rendezVous.getHeure().toLocalTime();
    LocalDateTime dateTimeRdv = LocalDateTime.of(dateRdv, heureRdv);
    logger.info("📅 RDV: {}", dateTimeRdv);

    // 🔁 Cas 1 : le RDV est **déjà passé**
    if (dateTimeRdv.isBefore(maintenant)) {
        // 🟨 Suppression de la facture si elle existe (ajouté)
        factureOpt.ifPresent(factureRepository::delete);
        serviceRendezVousRepository.deleteByRendezVous(rendezVous);
        rendezVousRepository.delete(rendezVous);
        return ResponseEntity.ok(new ApiResponse<>(200, "✅ Rendez-vous passé retiré de votre interface."));
    }

    // ⏳ Cas 2 : le RDV est à venir, mais < 24h
    long differenceHeures = Duration.between(maintenant, dateTimeRdv).toHours();
    logger.info("⌛️ Différence en heures: {}", differenceHeures);
    if (differenceHeures < 24) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ApiExceptionResponse(400, "❌ Vous devez annuler le rendez-vous au moins 24h à l'avance."));
    }

    // ✅ Cas 3 : annulation autorisée normalement
    // 🟨 Suppression de la facture si elle existe (ajouté)
    factureOpt.ifPresent(factureRepository::delete);
    serviceRendezVousRepository.deleteByRendezVous(rendezVous);
    rendezVousRepository.delete(rendezVous);

    return ResponseEntity.ok(new ApiResponse<>(200, "✅ Rendez-vous annulé avec succès !"));
}

    @Override
    public List<AppService> getAllServices() {
        return serviceRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<RendezVousDto> voirPlanning(Long clientId) {
        List<RendezVous> rendezVousList = rendezVousRepository.findAllWithClients();

        // 🔍 LOG : Vérifier ce que la base retourne
        System.out.println("🔍 Nombre de rendez-vous récupérés: " + rendezVousList.size());

        return rendezVousList.stream().map(rdv -> {
            System.out.println("🔹 RDV ID: " + rdv.getId());
            System.out.println("👤 Client: " + (rdv.getClient() != null ? rdv.getClient().getId() : "Aucun"));

            RendezVousDto dto = convertToDto(rdv);

            // ✅ Vérifier que le client ne voit que ses propres infos
            if (rdv.getClient() != null && rdv.getClient().getId() != null) {
                if (rdv.getClient().getId().equals(clientId)) {
                    System.out.println("✅ Le client " + clientId + " voit ses propres infos.");
                    ClientDto clientDto = this.modelMapper.map(rdv.getClient(), ClientDto.class);
                    clientDto.setMotDePasse(null); // Masquer le mot de passe
                    dto.setClientDto(clientDto);
                } else {
                    System.out.println("❌ Le client " + clientId + " ne peut pas voir ce rendez-vous.");
                    dto.setNomClient(null);
                    dto.setNumeroTelephoneClient(null);
                    dto.setClientDto(null);
                }
            } else {
                System.out.println("⚠️ Problème: Le client est null !");
                dto.setClientDto(null);
            }

            // ✅ Masquer le mot de passe de l'employé
            if (dto.getEmployeDto() != null) {
                dto.getEmployeDto().setMotDePasse(null);
            }

            return dto;
        }).collect(Collectors.toList());
    }

    public ClientDto updateUser(Long clientId, ClientDto clientDto) {
        AppClient client = clientRepository.findById(clientId)
                .orElseThrow(() -> new NotFoundException("Client non trouvé"));

        client.setNom(clientDto.getNom());
        client.setPrenom(clientDto.getPrenom());
        client.setEmail(clientDto.getEmail());
        client.setNumeroTelephone(clientDto.getNumeroTelephone());

        return convertClientToDto(clientRepository.save(client));
    }

    @Override
    public List<RendezVousDto> getRendezVousList() {
        List<RendezVousDto> rendezVousDtos = this.rendezVousRepository.findAll().stream().map(this::convertToDto).toList();
        return rendezVousDtos;
    }

    @Override
    public ClientDto create(AppClient client) {
        AppClient appClient = clientRepository.findByEmail(client.getEmail());
        if (appClient != null) {
            throw new BadRequestException("User already exist!");
        }
        client.setMotDePasse(passwordEncoder.encode(client.getMotDePasse()));
        return convertClientToDto(this.clientRepository.save(client));
    }

    @Override
    public ClientDto getClientById(Long clientId) {
        return convertClientToDto(this.clientRepository.findById(clientId).get());
    }

    @Override
    public ClientDto getClientByEmail(String email) {
        return convertClientToDto(this.clientRepository.findByEmail(email));
    }

    @Override
    public RendezVousDto getClientRendezVous(Long clientId) {
        RendezVous rendezVous = this.rendezVousRepository.findRendezVousByClientId(clientId).orElseThrow(() -> new NotFoundException("RendezVous not found"));
        return convertToDto(rendezVous);
    }

    @Override
    public List<RendezVousDto> getAllClientRendezVous(Long clientId) {
        List<RendezVous> rendezVous = this.rendezVousRepository
                .findAllRendezVousByClientId(clientId)
                .orElseThrow(() -> new NotFoundException("User not found : " + clientId));

        return rendezVous.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<ClientDto> getAllClients() {
        List<AppClient> appClients = this.clientRepository.findAll();
        return appClients.stream().map(this::convertClientToDto).collect(Collectors.toList());
    }

    public boolean isEmployeDisponible(Employe employe, Date date, Time heure, Time duree) {
        Time heureFinRdv = Time.valueOf(heure.toLocalTime().plusMinutes(duree.toLocalTime().getMinute()));

        List<RendezVous> rdvs = rendezVousRepository.findByEmployeAndDate(employe, date);

        for (RendezVous r : rdvs) {
            Time debut = r.getHeure();
            Time fin = Time.valueOf(debut.toLocalTime().plusMinutes(r.getDuree().toLocalTime().getMinute()));

            // Chevauchement ?
            if (!(heureFinRdv.before(debut) || heure.after(fin))) {
                return false;
            }
        }
        return true;
    }

    public boolean isClientDisponible(AppClient client, Date date, Time heure, Time duree) {
        // 🔁 Calcul de l'heure de fin du RDV demandé (converti en minutes totales)
        int dureeTotaleMinutes = duree.toLocalTime().getHour() * 60 + duree.toLocalTime().getMinute();
        Time heureFinRdv = Time.valueOf(heure.toLocalTime().plusMinutes(dureeTotaleMinutes));

        // 🗂 Liste des rendez-vous déjà pris par ce client à cette date
        List<RendezVous> rdvs = rendezVousRepository.findByClientAndDate(client, date);

        for (RendezVous r : rdvs) {
            Time debut = r.getHeure();

            // 💡 Calcul précis de la durée du RDV en minutes totales
            int rdvDureeMinutes = r.getDuree().toLocalTime().getHour() * 60 + r.getDuree().toLocalTime().getMinute();
            Time fin = Time.valueOf(debut.toLocalTime().plusMinutes(rdvDureeMinutes));

            // 🔍 Vérification de chevauchement
            boolean chevauchement = !(heureFinRdv.before(debut) || heure.after(fin));

            if (chevauchement) {
                System.out.println("❌ Conflit détecté : "
                        + "Nouveau RDV [" + heure + " - " + heureFinRdv + "] "
                        + "chevauche avec RDV existant [" + debut + " - " + fin + "]");
                return false;
            }
        }

        return true;
    }

    @Override
    public List<PlanningJourDto> getPlanningMensuel(Long clientId, int mois, int annee) {
        LocalDate debut = LocalDate.of(annee, mois, 1);
        LocalDate fin = debut.withDayOfMonth(debut.lengthOfMonth());

        List<Jour> joursDuMois = jourRepository.findByDateDuJourBetween(java.sql.Date.valueOf(debut), java.sql.Date.valueOf(fin));
        List<RendezVous> rdvsDuMois = rendezVousRepository.findByDateBetweenWithDetails(java.sql.Date.valueOf(debut), java.sql.Date.valueOf(fin));

        Map<Long, List<RendezVous>> rdvsParEmploye = rdvsDuMois.stream()
                .filter(r -> r.getEmploye() != null)
                .collect(Collectors.groupingBy(r -> r.getEmploye().getId()));

        List<PlanningJourDto> result = new ArrayList<>();

        for (Jour jour : joursDuMois) {
            Employe employe = jour.getEmploye();
            if (employe == null) {
                continue;
            }

            List<RendezVous> rdvs = rdvsParEmploye.getOrDefault(employe.getId(), Collections.emptyList()).stream()
                    .filter(rdv -> {
                        if (rdv.getDate() == null || jour.getDateDuJour() == null) {
                            return false;
                        }

                        LocalDate rdvDate = LocalDate.of(
                                rdv.getDate().getYear() + 1900,
                                rdv.getDate().getMonth() + 1,
                                rdv.getDate().getDate()
                        );
                        LocalDate jourDate = LocalDate.of(
                                jour.getDateDuJour().getYear() + 1900,
                                jour.getDateDuJour().getMonth() + 1,
                                jour.getDateDuJour().getDate()
                        );

                        return rdvDate.equals(jourDate);
                    })
                    .collect(Collectors.toList());

            List<SlotDto> slots = new ArrayList<>();
            for (RendezVous rdv : rdvs) {
                SlotDto slot = new SlotDto();

                Time heureDebut = rdv.getHeure();
                Time duree = rdv.getDuree();

                if (heureDebut != null && duree != null) {
                    int totalMinutes = duree.toLocalTime().getHour() * 60 + duree.toLocalTime().getMinute();
                    Time heureFin = Time.valueOf(heureDebut.toLocalTime().plusMinutes(totalMinutes));

                    slot.setHeure(heureDebut.toString().substring(0, 5));
                    slot.setHeureFin(heureFin.toString().substring(0, 5));
                    slot.setDuree(duree);
                }

                boolean estMoi = rdv.getClient() != null && rdv.getClient().getId().equals(clientId);
                slot.setEstProprietaire(estMoi);
                if (estMoi) {
                    String servicesConcat = rdv.getServiceRendezVous().stream()
                            .map(srv -> srv.getServices().getNom())
                            .collect(Collectors.joining(", "));

                    slot.setServiceNom(servicesConcat);
                } else {
                    slot.setServiceNom("Occupé");
                }

                slots.add(slot);
            }

            PlanningJourDto planning = new PlanningJourDto();
            planning.setDate(jour.getDateDuJour().toString());
            planning.setTypeDeJour(jour.getTypeDeJour().name());
            planning.setEmployeId(employe.getId());
            planning.setEmployeNom(employe.getPrenom() + " " + employe.getNom());
            planning.setRendezVous(slots);
            if (jour.getTypeDeJour() == TypeDeJour.JC || jour.getTypeDeJour() == TypeDeJour.DC) {
                Time heureDebut = jour.getHeureDebut();
                Time heureFin = jour.getHeureFin();

                if (heureDebut.equals(Time.valueOf("09:00:00")) && heureFin.equals(Time.valueOf("13:30:00"))) {
                    planning.setCommentaire("🕘 Congé le matin");
                } else if (heureDebut.equals(Time.valueOf("13:30:00")) && heureFin.equals(Time.valueOf("18:00:00"))) {
                    planning.setCommentaire("🕒 Congé l'après-midi");
                } else {
                    planning.setCommentaire("🛌 Congé journée entière");
                }
            }

            result.add(planning);
        }

        return result;
    }

    RendezVousDto convertToDto(RendezVous rendezVous) {
        ClientDto clientDto = this.modelMapper.map(rendezVous.getClient(), ClientDto.class);
        EmployeDto employeDto = this.modelMapper.map(rendezVous.getEmploye(), EmployeDto.class);
        Set<ServiceRendezVousDto> serviceRendezVousDtos = rendezVous.getServiceRendezVous()
                .stream()
                .map(serviceRendezVous -> {
                    ServiceRendezVousDto dto = modelMapper.map(serviceRendezVous, ServiceRendezVousDto.class);

                    if (serviceRendezVous.getServices() != null) {
                        dto.setServicesDto(modelMapper.map(serviceRendezVous.getServices(), AppServiceDto.class));
                    }

                    if (serviceRendezVous.getRendezVous() != null) {
                        dto.setRendezVousDto(modelMapper.map(serviceRendezVous.getRendezVous(), RendezVousDto.class));
                    }

                    return dto;
                })
                .collect(Collectors.toSet());

        RendezVousDto rendezVousDto = this.modelMapper.map(rendezVous, RendezVousDto.class);
        rendezVousDto.setClientDto(clientDto);
        rendezVousDto.setEmployeDto(employeDto);
        rendezVousDto.setServiceRendezVousDtos(serviceRendezVousDtos);
        return rendezVousDto;
    }

    ClientDto convertClientToDto(AppClient appClient) {
        ClientDto appUserDto = this.modelMapper.map(appClient, ClientDto.class);
        return appUserDto;
    }

}
