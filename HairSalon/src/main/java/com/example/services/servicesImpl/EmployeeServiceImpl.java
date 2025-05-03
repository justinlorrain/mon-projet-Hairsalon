package com.example.services.servicesImpl;

import com.example.exception.BadRequestException;
import com.example.exception.NotFoundException;
import com.example.models.AppClient;
import com.example.models.AppService;

import com.example.models.Employe;
import com.example.models.Facture;
import com.example.models.Jour;
import com.example.models.JoursFerie;
import com.example.models.JoursFermetureReguliers;
import com.example.models.RendezVous;
import com.example.models.Role;
import com.example.models.ServiceRendezVous;
import com.example.models.TypeDeJour;
import com.example.models.dto.ApiExceptionResponse;
import com.example.models.dto.ApiResponse;
import com.example.models.dto.AppServiceDto;
import com.example.models.dto.ClientDto;
import com.example.models.dto.EmployeDto;
import com.example.models.dto.FactureDto;
import com.example.models.dto.JourDto;
import com.example.models.dto.PlanningJourDto;
import com.example.models.dto.RendezVousDto;
import com.example.models.dto.ServiceRendezVousDto;
import com.example.models.dto.SlotDto;
import com.example.repositories.ClientRepository;
import com.example.repositories.EmployeRepository;
import com.example.repositories.FactureRepository;
import com.example.repositories.JourFerieRepository;
import com.example.repositories.JourRepository;
import com.example.repositories.JoursFermetureReguliersRepository;
import com.example.repositories.RendezVousRepository;
import com.example.repositories.ServiceRendezVousRepository;
import com.example.services.IEmployeeService;
import com.example.services.MailService;
import jakarta.persistence.criteria.Path;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;

import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.sql.Time;

import java.time.DayOfWeek;
import java.time.LocalDate;

import org.springframework.transaction.annotation.Transactional;

import java.sql.Date;
import java.time.Instant;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import static org.hibernate.internal.CoreLogging.logger;
import static org.hibernate.internal.HEMLogging.logger;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

@Service
public class EmployeeServiceImpl implements IEmployeeService {

    private EmployeRepository employeRepository;
    private JourRepository jourRepository;
    private ModelMapper modelMapper;
    private final MailService mailService;
    private ClientRepository clientRepository;
    private RendezVousRepository rendezVousRepository;
    private ServiceRendezVousRepository serviceRendezVousRepository;
    private FactureRepository factureRepository;
    private JourFerieRepository jourFerieRepository;
    private final JoursFermetureReguliersRepository fermetureRepository;

    private PasswordEncoder passwordEncoder;
    private static final Logger logger = LoggerFactory.getLogger(EmployeeServiceImpl.class);

    @Autowired
    public EmployeeServiceImpl(ClientRepository clientRepository, MailService mailService, JoursFermetureReguliersRepository fermetureRepository, JourFerieRepository jourFerieRepository, FactureRepository factureRepository, EmployeRepository employeRepository, JourRepository jourRepository, RendezVousRepository rendezVousRepository, ServiceRendezVousRepository serviceRendezVousRepository, ModelMapper modelMapper, PasswordEncoder passwordEncoder1) {
        this.clientRepository = clientRepository;
        this.rendezVousRepository = rendezVousRepository;
        this.serviceRendezVousRepository = serviceRendezVousRepository;
        this.employeRepository = employeRepository;
        this.jourFerieRepository = jourFerieRepository;
        this.modelMapper = modelMapper;
        this.factureRepository = factureRepository;
        this.jourRepository = jourRepository;
        this.fermetureRepository = fermetureRepository;
        this.passwordEncoder = passwordEncoder1;
        this.mailService = mailService;
    }

    @Override
    public ResponseEntity<?> createEmployee(Employe employe) {
        if (employe.getPlanning() != null && !employe.getPlanning().isEmpty()) {
            employe.getPlanning()
                    .forEach(planning -> planning.setEmploye(employe));
        }
        // Enregistrer l'employé et ses plannings
        employe.setMotDePasse(passwordEncoder.encode(employe.getMotDePasse()));
        Employe employe1 = this.employeRepository.findEmployeByEmail(employe.getEmail());
        if (employe1 != null) {
            throw new BadRequestException("User already exist!");
        }
        Employe savedEmployee = this.employeRepository.save(employe);
        return ResponseEntity.status(HttpStatus.OK).body("L'employé à été enregistré avec succès !");
    }

    @Override
    public ResponseEntity<?> updateEmployee(Employe employeDetails, Long id) {
        // Récupérer l'employé existant dans la base de données
        Optional<Employe> employeOptional = employeRepository.findById(id);

        if (employeOptional.isEmpty()) {
            // Si l'employé n'existe pas, retourner une réponse 404
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Employé non trouvé");
        }

        Employe existingEmploye = employeOptional.get();

        // Mettre à jour les informations de l'employé
        existingEmploye.setNom(employeDetails.getNom());
        existingEmploye.setPrenom(employeDetails.getPrenom());
        existingEmploye.setEmail(employeDetails.getEmail());
        existingEmploye.setNumeroTelephone(employeDetails.getNumeroTelephone());
        existingEmploye.setRole(employeDetails.getRole());
        existingEmploye.setMotDePasse(employeDetails.getMotDePasse());

        // Mettre à jour le planning
        if (employeDetails.getPlanning() != null && !employeDetails.getPlanning().isEmpty()) {
            // Supprimer les anciens plannings (ou les mettre à jour si nécessaire)
            existingEmploye.getPlanning().clear();

            // Associer chaque planning au nouvel employé et les ajouter à la liste
            employeDetails.getPlanning().stream()
                    .forEach(planning -> {
                        planning.setEmploye(existingEmploye);
                        existingEmploye.getPlanning().add(planning);
                    });
        }

        // Sauvegarder l'employé mis à jour
        Employe updatedEmploye = employeRepository.save(existingEmploye);

        // Retourner la réponse avec l'employé mis à jour
        return ResponseEntity.ok().body("Succès");
    }

    @Override
    public ResponseEntity<?> prendreRendezVous(RendezVousDto rendezVousDto, List<Long> serviceIds) {
        // 📌 Vérifier si l'employé existe
        Employe employe = employeRepository.findById(rendezVousDto.getEmployeDto().getId())
                .orElseThrow(() -> new NotFoundException("Employé non trouvé ID : " + rendezVousDto.getEmployeDto().getId()));

        Date dateRdv = rendezVousDto.getDate();
        Time heureRdv = rendezVousDto.getHeure();
        Time dureeRdv = rendezVousDto.getDuree();
        Long clientId = rendezVousDto.getClientDto().getId();

        // ✅ Vérifier si la date du rendez-vous est dans le passé
        if (dateRdv.before(Date.valueOf(LocalDate.now()))) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("⚠️ Impossible de prendre un rendez-vous dans le passé !");
        }

        // ✅ Vérifier si l'employé travaille ce jour-là
        Optional<Jour> jourTravailOpt = jourRepository.findByDateDuJourAndEmploye(dateRdv, employe)
                .stream()
                .filter(jour -> jour.getTypeDeJour() == TypeDeJour.T) // On ne prend que les jours ouvrables
                .findFirst();

        if (jourTravailOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("⚠️ L'employé ne travaille pas ce jour-là !");
        }

        Jour jourTravail = jourTravailOpt.get();

        // ✅ Vérifier si l'heure du rendez-vous respecte les horaires de l'employé
        if (heureRdv.before(jourTravail.getHeureDebut()) || heureRdv.after(jourTravail.getHeureFin())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("⚠️ L'heure du rendez-vous est en dehors des horaires de travail !");
        }

        // ✅ Vérifier si le client est disponible après son dernier rendez-vous
        if (!isClientDisponible(clientId, dateRdv, heureRdv, dureeRdv)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("⚠️ Le client a déjà un rendez-vous actif à cette heure !");
        }
// ✅ Vérifier si l'employé est déjà occupé à cet horaire
        if (!isEmployeDisponible(employe.getId(), dateRdv, heureRdv, dureeRdv)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("⚠️ Cet employé a déjà un rendez-vous à cette heure !");
        }

        // ✅ **Empêcher un client d'avoir un rendez-vous qui se chevauche avec un autre employé**
        /* boolean clientDejaOccupe = rendezVousRepository.existsByClientIdAndDateAndChevauchement(
            clientId,
            dateRdv,
            heureRdv,
            dureeRdv
    );

    if (clientDejaOccupe) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body("⚠️ Ce client a déjà un rendez-vous qui chevauche cet horaire avec un autre employé !");
    }*/
        // ✅ Création du rendez-vous
        RendezVous rendezVous = new RendezVous();
        rendezVous.setDuree(dureeRdv);
        rendezVous.setDate(dateRdv);
        rendezVous.setHeure(heureRdv);
        rendezVous.setEmploye(employe);
        rendezVous.setClient(clientRepository.findById(clientId).get());
        rendezVous = rendezVousRepository.save(rendezVous);

        // ✅ Associer les services demandés au rendez-vous
        for (Long serviceId : serviceIds) {
            ServiceRendezVous serviceRendezVous = new ServiceRendezVous();
            serviceRendezVous.setRendezVous(rendezVous);
            AppService service = new AppService();
            service.setId(serviceId);
            serviceRendezVous.setServices(service);

            serviceRendezVousRepository.save(serviceRendezVous);
        }

        return ResponseEntity.ok().body("✅ Rendez-vous créé avec succès !");
    }

    public boolean isClientDisponible(Long clientId, Date date, Time heure, Time duree) {
        // 🔥 Récupérer tous les rendez-vous du client pour ce jour-là
        List<RendezVous> rendezVousList = rendezVousRepository.findByClientIdAndDate(clientId, date);

        // ✅ Convertir les heures en `LocalTime`
        LocalTime heureDebutNouveauRdv = heure.toLocalTime();
        LocalTime heureFinNouveauRdv = heureDebutNouveauRdv.plusMinutes(duree.toLocalTime().toSecondOfDay() / 60);

        System.out.println("🔍 [Vérification Client] ID: " + clientId);
        System.out.println("   ➡️ Nouveau RDV : " + heureDebutNouveauRdv + " - " + heureFinNouveauRdv);

        for (RendezVous rdv : rendezVousList) {
            LocalTime heureDebutRdv = rdv.getHeure().toLocalTime();
            LocalTime heureFinRdv = heureDebutRdv.plusMinutes(rdv.getDuree().toLocalTime().toSecondOfDay() / 60);

            System.out.println("   ⏳ RDV existant : " + heureDebutRdv + " - " + heureFinRdv);

            // ✅ **Correction stricte de la condition de chevauchement**
            boolean chevauchement = heureDebutNouveauRdv.isBefore(heureFinRdv) && heureFinNouveauRdv.isAfter(heureDebutRdv);

            if (chevauchement) {
                System.out.println("   ❌ Conflit détecté ! RDV refusé.");
                return false; // 🚫 Conflit détecté
            }
        }

        System.out.println("   ✅ Aucun conflit détecté, RDV accepté.");
        return true; // ✅ Aucun conflit, le client peut réserver
    }

    public boolean isEmployeDisponible(Long employeId, Date date, Time heure, Time duree) {
        // 🔥 Récupérer tous les rendez-vous de l'employé pour ce jour-là
        List<RendezVous> rendezVousList = rendezVousRepository.findByEmployeIdAndDate(employeId, date);

        // ✅ Convertir les heures en `LocalTime`
        LocalTime heureDebutNouveauRdv = heure.toLocalTime();
        LocalTime heureFinNouveauRdv = heureDebutNouveauRdv.plusMinutes(duree.toLocalTime().toSecondOfDay() / 60);

        System.out.println("🔍 [Vérification Employé] ID: " + employeId);
        System.out.println("   ➡️ Nouveau RDV : " + heureDebutNouveauRdv + " - " + heureFinNouveauRdv);

        for (RendezVous rdv : rendezVousList) {
            LocalTime heureDebutRdv = rdv.getHeure().toLocalTime();
            LocalTime heureFinRdv = heureDebutRdv.plusMinutes(rdv.getDuree().toLocalTime().toSecondOfDay() / 60);

            System.out.println("   ⏳ RDV existant : " + heureDebutRdv + " - " + heureFinRdv);

            // ✅ **Condition stricte de chevauchement**
            boolean chevauchement = heureDebutNouveauRdv.isBefore(heureFinRdv) && heureFinNouveauRdv.isAfter(heureDebutRdv);

            if (chevauchement) {
                System.out.println("   ❌ Conflit détecté ! RDV refusé.");
                return false; // 🚫 Conflit détecté
            }
        }

        System.out.println("   ✅ Aucun conflit détecté, RDV accepté.");
        return true; // ✅ Aucun conflit, l'employé est libre
    }

    @Override
    public ResponseEntity<?> deplacerRendezVous(Long rendezVousId, String nouvelleDate, String nouvelleHeure) {
        Logger logger = LoggerFactory.getLogger(getClass());

        Optional<RendezVous> rendezVousOpt = rendezVousRepository.findById(rendezVousId);
        if (rendezVousOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiExceptionResponse(404, "❌ Rendez-vous non trouvé !"));
        }

        RendezVous rendezVous = rendezVousOpt.get();
        Employe employe = rendezVous.getEmploye();

        Date convertDate = Date.valueOf(nouvelleDate);
        Time newHour;
        try {
            newHour = Time.valueOf(nouvelleHeure);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiExceptionResponse(400, "❌ Format de l'heure invalide !"));
        }

        if (convertDate.before(Date.valueOf(LocalDate.now()))) {
            return ResponseEntity.badRequest().body(new ApiExceptionResponse(400, "❌ Date passée interdite."));
        }

        if (jourFerieRepository.existsByDate(convertDate)) {
            return ResponseEntity.badRequest().body(new ApiExceptionResponse(400, "❌ Jour férié !"));
        }

        DayOfWeek day = convertDate.toLocalDate().getDayOfWeek();
        if (day == DayOfWeek.SUNDAY || day == DayOfWeek.MONDAY) {
            return ResponseEntity.badRequest().body(new ApiExceptionResponse(400, "❌ Fermeture hebdomadaire."));
        }

        Time ouvertureSalon = Time.valueOf("09:00:00");
        Time fermetureSalon = Time.valueOf("18:00:00");

        if (newHour.before(ouvertureSalon) || newHour.after(fermetureSalon)) {
            return ResponseEntity.badRequest().body(new ApiExceptionResponse(400, "❌ Heure en dehors des horaires du salon (9h-18h)."));
        }

        if (rendezVous.getClient() == null || rendezVous.getClient().getId() == null) {
            return ResponseEntity.badRequest().body(new ApiExceptionResponse(400, "❌ Client non valide."));
        }

        int dureeMinutes = rendezVous.getDuree().toLocalTime().toSecondOfDay() / 60;
        Long count = rendezVousRepository.countOverlappingRdv(
                rendezVous.getClient().getId(),
                employe.getId(),
                convertDate,
                newHour,
                dureeMinutes,
                rendezVous.getId()
        );

        if (count > 0) {
            return ResponseEntity.badRequest().body(new ApiExceptionResponse(400, "❌ Conflit : créneau déjà occupé."));
        }

        List<Jour> jours = jourRepository.findByDateDuJourAndEmploye(convertDate, employe);
        if (jours.isEmpty()) {
            return ResponseEntity.badRequest().body(new ApiExceptionResponse(400, "❌ Aucun horaire défini pour cet employé ce jour-là."));
        }

        boolean inPlageTravail = false;
        for (Jour jour : jours) {
            if (jour.getTypeDeJour() == TypeDeJour.T) {
                Time debut = jour.getHeureDebut();
                Time fin = jour.getHeureFin();
                int rdvDebut = newHour.toLocalTime().toSecondOfDay();
                int rdvFin = rdvDebut + rendezVous.getDuree().toLocalTime().toSecondOfDay();

                int plageDebut = debut.toLocalTime().toSecondOfDay();
                int plageFin = fin.toLocalTime().toSecondOfDay();

                if (rdvDebut >= plageDebut && rdvFin <= plageFin) {
                    inPlageTravail = true;
                    break;
                }
            }
        }

        if (!inPlageTravail) {
            return ResponseEntity.badRequest().body(new ApiExceptionResponse(400, "❌ L'heure choisie est dans une plage de congé ou hors horaire de travail."));
        }

        rendezVous.setDate(convertDate);
        rendezVous.setHeure(newHour);
        rendezVousRepository.save(rendezVous);

        logger.info("✅ RDV déplacé avec succès : {} à {} pour l'employé {}", convertDate, newHour, employe.getId());

        return ResponseEntity.ok(new ApiResponse<>(200, "✅ Rendez-vous déplacé avec succès !"));
    }

    @Override
    @Transactional
    public ResponseEntity<?> annulerRendezVous(Long rendezVousId) {
        Optional<RendezVous> rendezVousOpt = rendezVousRepository.findById(rendezVousId);

        if (rendezVousOpt.isEmpty()) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(new ApiExceptionResponse(404, "❌ Rendez-vous non trouvé"));
        }

        RendezVous rendezVous = rendezVousOpt.get();

        // 💥 Supprimer la facture associée s'il y en a une
        factureRepository.findByRendezVous(rendezVous).ifPresent(factureRepository::delete);

        // 🔥 Supprimer les services associés avant de supprimer le rendez-vous
        serviceRendezVousRepository.deleteByRendezVous(rendezVous);

        // ✉️ Avertir le client par mail (AVANT suppression)
        AppClient client = rendezVous.getClient(); // ou getAppClient() si c’est le nom du champ

        if (client != null && client.getEmail() != null) {
            String contenu = String.format(
                    "Bonjour %s,\n\nVotre rendez-vous prévu le %s à %s a été annulé.\n\nMerci de votre compréhension.",
                    client.getPrenom(),
                    rendezVous.getDate().toString().split(" ")[0],
                    rendezVous.getHeure()
            );

            mailService.envoyerMail(
                    client.getEmail(),
                    "Annulation de votre rendez-vous",
                    contenu
            );
        }

        // 🔥 Supprimer ensuite le rendez-vous
        rendezVousRepository.delete(rendezVous);

        return ResponseEntity.ok(new ApiResponse<>(200, "✅ Rendez-vous annulé et email envoyé au client !"));
    }

    @Override
    public List<RendezVousDto> getRendezVousList() {
        return this.rendezVousRepository.findAll().stream().map(this::convertToDto).toList();
    }
    
  public byte[] genererFacturePdf(Facture facture, AppClient client, List<ServiceRendezVous> services, RendezVous rdv) {
    try (PDDocument doc = new PDDocument(); ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
        PDPage page = new PDPage(PDRectangle.A4);
        doc.addPage(page);

        try (PDPageContentStream content = new PDPageContentStream(doc, page)) {
            content.setFont(PDType1Font.HELVETICA_BOLD, 16);
            content.beginText();
            content.newLineAtOffset(50, 750);
           content.showText("Facture - Salon de Coiffure");

            content.setFont(PDType1Font.HELVETICA, 12);
            content.newLineAtOffset(0, -30);
            content.showText("Client : " + client.getPrenom() + " " + client.getNom());
            content.newLineAtOffset(0, -20);
            content.showText("Email : " + client.getEmail());
            content.newLineAtOffset(0, -20);
            content.showText("Date : " + rdv.getDate().toString() + " à " + rdv.getHeure().toString().substring(0, 5));

            
            content.newLineAtOffset(0, -30);
            content.showText("Services :");
            for (ServiceRendezVous srv : services) {
                content.newLineAtOffset(0, -20);
                content.showText("- " + srv.getServices().getNom() + " : " + srv.getServices().getMontant() + "€");
            }
            
            content.newLineAtOffset(0, -30);
            content.setFont(PDType1Font.HELVETICA_BOLD, 14);
            content.showText("Total : " + facture.getMontant() + " €");
            content.endText();
        }

        doc.save(baos);
        return baos.toByteArray();
    } catch (Exception e) {
        e.printStackTrace();
        return null;
    }
}
    @Override
    public ResponseEntity<?> createFacture(Long rendezVousId, Long employeeId) {
        RendezVous rdv = rendezVousRepository.findById(rendezVousId)
                .orElseThrow(() -> new NotFoundException("RDV introuvable"));

        // ✅ Vérifier s’il y a déjà une facture liée à ce RDV
        Optional<Facture> existingFacture = factureRepository.findByRendezVous(rdv);
        if (existingFacture.isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("⚠️ Une facture a déjà été générée pour ce rendez-vous !");
        }

        Employe employe = employeRepository.findById(employeeId)
                .orElseThrow(() -> new NotFoundException("Employé introuvable"));

        List<ServiceRendezVous> services = serviceRendezVousRepository.findByRendezVous(rdv);
        double total = services.stream()
                .mapToDouble(s -> s.getServices().getMontant())
                .sum();

        Facture facture = new Facture();
        facture.setMontant(total);
        facture.setDate(new java.sql.Date(new java.util.Date().getTime()));
        facture.setEstPayee(false);
        facture.setRendezVous(rdv);
        facture = factureRepository.save(facture);
        
        // 🟩 ➕ AJOUTE ICI : génération du PDF juste après avoir enregistré la facture

byte[] pdfBytes = genererFacturePdf(facture, rdv.getClient(), services,rdv);

try {
            java.nio.file.Path path = Paths.get("factures/facture_" + facture.getId() + ".pdf");
    Files.createDirectories(path.getParent()); // crée le dossier "factures" s'il n'existe pas
    Files.write(path, pdfBytes); // écrit le PDF dans le fichier
} catch (IOException e) {
    e.printStackTrace();
    // log optionnel
}


        // 📦 Construction du DTO
        FactureDto dto = new FactureDto();
        dto.setId(facture.getId());
        dto.setDate((Date) facture.getDate());
        dto.setMontant(facture.getMontant());
        dto.setEstPayee(facture.isEstPayee());
        dto.setRendezVousId(rdv.getId());
        dto.setClientNom(rdv.getClient().getPrenom() + " " + rdv.getClient().getNom());
        dto.setClientEmail(rdv.getClient().getEmail());
        dto.setServices(services.stream().map(s -> s.getServices().getNom()).toList());

       return ResponseEntity.ok()
        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=facture_" + facture.getId() + ".pdf")
        .contentType(MediaType.APPLICATION_PDF)
        .body(pdfBytes); // ✅ ici tu "lis" bien le contenu

    }

    @Override
    @Transactional
    public ResponseEntity<?> modifierHoraire(Long employeId, List<Jour> joursModifies) {
        Employe employe = employeRepository.findById(employeId)
                .orElseThrow(() -> new NotFoundException("❌ Employé non trouvé ID : " + employeId));

        List<String> joursModifiesEffectivement = new ArrayList<>();

        for (Jour jourModifie : joursModifies) {
            Date date = jourModifie.getDateDuJour();
            TypeDeJour type = jourModifie.getTypeDeJour();

            System.out.println("🔍 Traitement du " + date + " - Type demandé : " + type);

            // 🔒 Ignorer jours fériés
            if (jourFerieRepository.existsByDate(date)) {
                System.out.println("❌ Jour férié ignoré : " + date);
                continue;
            }

            // 🔒 Ignorer dimanche/lundi
            DayOfWeek dayOfWeek = date.toLocalDate().getDayOfWeek();
            if (dayOfWeek == DayOfWeek.SUNDAY || dayOfWeek == DayOfWeek.MONDAY) {
                System.out.println("❌ Fermeture hebdo ignorée : " + dayOfWeek);
                continue;
            }

            // 🔍 Jour existant ?
            Optional<Jour> jourOpt = jourRepository.findFirstByDateDuJourAndEmploye(date, employe);
            if (jourOpt.isEmpty()) {
                System.out.println("❌ Aucun jour trouvé pour cette date : " + date);
                continue;
            }

            Jour jourExistant = jourOpt.get();

            switch (type) {
                case JC, M -> {
                    jourExistant.setTypeDeJour(type);
                    jourExistant.setHeureDebut(null);
                    jourExistant.setHeureFin(null);
                    joursModifiesEffectivement.add(date + " [" + type + "]");
                }

                case DC, T -> {
                    if (jourModifie.getHeureDebut() == null || jourModifie.getHeureFin() == null
                            || jourModifie.getHeureDebut().after(jourModifie.getHeureFin())) {
                        System.out.println("❌ Heures invalides pour " + type + " : " + date);
                        continue;
                    }

                    // 🔍 Vérifier s’il y a des RDVs hors de la nouvelle plage
                    boolean rdvConflits = rendezVousRepository.existsByEmployeIdAndDateAndEnDehorsDuNouvelHoraire(
                            employeId,
                            date,
                            jourModifie.getHeureDebut(),
                            jourModifie.getHeureFin()
                    );

                    if (rdvConflits) {
                        System.out.println("⚠️ RDVs en dehors du créneau → l’admin doit les déplacer avant");
                        return ResponseEntity.status(HttpStatus.CONFLICT)
                                .body("⚠️ Des rendez-vous existent en dehors du nouvel horaire pour le " + date
                                        + ". Veuillez les déplacer avant de modifier les horaires.");
                    }

                    jourExistant.setTypeDeJour(type);
                    jourExistant.setHeureDebut(jourModifie.getHeureDebut());
                    jourExistant.setHeureFin(jourModifie.getHeureFin());
                    joursModifiesEffectivement.add(date + " [" + type + "]");
                }

                default -> {
                    System.out.println("❌ Type inconnu : " + type);
                    continue;
                }
            }

            jourRepository.save(jourExistant);
            System.out.println("✅ Modifié : " + date);
        }

        return ResponseEntity.ok("✅ Jours modifiés : " + String.join(", ", joursModifiesEffectivement));
    }

    @Override
public void genererCalendrierAnnuel(LocalDate startDate) {
    jourRepository.deleteAll(); // Nettoyage total

    LocalDate now = LocalDate.now();
    LocalDate debut = LocalDate.of(now.getYear(), 1, 1);
    LocalDate fin = LocalDate.of(now.getYear() + 1, 12, 31);
    LocalDate currentDate = debut;

    List<Employe> employes = employeRepository.findAllEmployes();
    List<JoursFerie> joursFeries = jourFerieRepository.findAll();

    List<DayOfWeek> joursFermetureReguliers = fermetureRepository.findAll()
            .stream()
            .map(j -> convertirEnDayOfWeek(j.getJourDeLaSemaine()))
            .collect(Collectors.toList());

    while (!currentDate.isAfter(fin)) {
            Date sqlDate = Date.valueOf(currentDate);

            boolean estJourFerie = joursFeries.stream()
                    .anyMatch(jf -> jf.getDate().equals(sqlDate));

            if (estJourFerie) {
                ajouterJourFermetureRegulier(sqlDate, TypeDeJour.JF);
            } else if (joursFermetureReguliers.contains(currentDate.getDayOfWeek())) {
                ajouterJourFermetureRegulier(sqlDate, TypeDeJour.FH);
            } else {
                for (Employe employe : employes) {
                    ajouterJourDeTravail(sqlDate, employe);
                }
            }

            currentDate = currentDate.plusDays(1);
        }
    }

    private DayOfWeek convertirEnDayOfWeek(String jourFr) {
        switch (jourFr.toLowerCase()) {
            case "lundi" -> {
                return DayOfWeek.MONDAY;
            }
            case "mardi" -> {
                return DayOfWeek.TUESDAY;
            }
            case "mercredi" -> {
                return DayOfWeek.WEDNESDAY;
            }
            case "jeudi" -> {
                return DayOfWeek.THURSDAY;
            }
            case "vendredi" -> {
                return DayOfWeek.FRIDAY;
            }
            case "samedi" -> {
                return DayOfWeek.SATURDAY;
            }
            case "dimanche" -> {
                return DayOfWeek.SUNDAY;
            }
            default ->
                throw new IllegalArgumentException("Jour invalide : " + jourFr);
        }
    }

    @Override
    public List<PlanningJourDto> getPlanningMensuel(int mois, int annee) {
        LocalDate debut = LocalDate.of(annee, mois, 1);
        LocalDate fin = debut.withDayOfMonth(debut.lengthOfMonth());

        List<Jour> joursDuMois = jourRepository.findByDateDuJourBetween(Date.valueOf(debut), Date.valueOf(fin));
        List<RendezVous> rdvsDuMois = rendezVousRepository.findByDateBetweenWithDetails(Date.valueOf(debut), Date.valueOf(fin));

        // 🔒 Fix potentielle erreur immutabilité
        Map<Long, List<RendezVous>> rdvsParEmploye = rdvsDuMois.stream()
                .filter(r -> r.getEmploye() != null)
                .collect(Collectors.groupingBy(
                        r -> r.getEmploye().getId(),
                        Collectors.collectingAndThen(Collectors.toList(), ArrayList::new)
                ));

        List<PlanningJourDto> result = new ArrayList<>();

        for (Jour jour : joursDuMois) {
            try {
                Employe employe = jour.getEmploye();
                if (employe == null) {
                    // 🔒 Gérer les jours sans employé (FH ou JF)
                    PlanningJourDto jourGlobal = new PlanningJourDto();
                    jourGlobal.setDate(jour.getDateDuJour().toString());
                    jourGlobal.setTypeDeJour(jour.getTypeDeJour().name());
                    jourGlobal.setEmployeId(null); // ou -1 pour l’identifier facilement
                    jourGlobal.setEmployeNom(jour.getTypeDeJour() == TypeDeJour.FH ? "Fermeture Hebdo" : "Jour Férié");
                    jourGlobal.setRendezVous(new ArrayList<>());
                    result.add(jourGlobal);
                    continue;
                }

                // 🔁 Tous les rendez-vous de l'employé ce jour-là
                List<RendezVous> rdvs = rdvsParEmploye.getOrDefault(employe.getId(), Collections.emptyList()).stream()
                        .filter(rdv -> {
                            if (rdv.getDate() == null || jour.getDateDuJour() == null) {
                                return false;
                            }
                            LocalDate rdvDate = Instant.ofEpochMilli(rdv.getDate().getTime())
                                    .atZone(ZoneId.systemDefault())
                                    .toLocalDate();

                            LocalDate jourDate = Instant.ofEpochMilli(jour.getDateDuJour().getTime())
                                    .atZone(ZoneId.systemDefault())
                                    .toLocalDate();

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

                    // ✅ Pour l’admin/employé : toujours afficher les infos du client
                    if (rdv.getClient() != null) {
                        slot.setClientNom(rdv.getClient().getNom());
                        slot.setClientPrenom(rdv.getClient().getPrenom());
                        slot.setClientEmail(rdv.getClient().getEmail());
                        slot.setClientTel(rdv.getClient().getNumeroTelephone());
                    }

                    // ✅ Service du rendez-vous
                    slot.setServiceNom(
                            rdv.getServiceRendezVous().stream()
                                    .map(srv -> srv.getServices().getNom())
                                    .collect(Collectors.joining(", "))
                    );

                    // ❌ Pas besoin de ce champ ici, mais tu peux le garder si nécessaire
                    slot.setEstProprietaire(false);

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

            } catch (Exception e) {
                System.err.println("❌ Erreur lors du traitement du jour : " + jour.getDateDuJour());
                e.printStackTrace();
            }

        }
        result.sort(Comparator.comparing(PlanningJourDto::getDate));
        return result;
    }

    @Override
    public List<JourDto> getCalendrier() {
        List<Jour> jours = jourRepository.findAllWithoutLimit();

        // 📌 DEBUG : Afficher tous les jours récupérés
        System.out.println("📌 Jours récupérés du calendrier : ");
        for (Jour j : jours) {
            System.out.println("   ➡️ " + j.getDateDuJour() + " | Type : " + j.getTypeDeJour() + " | Employé : " + (j.getEmploye() != null ? j.getEmploye().getId() : "Aucun"));
        }

        // 📌 Vérifier si la liste est vide
        if (jours == null || jours.isEmpty()) {
            throw new NotFoundException("⚠️ Aucun jour trouvé dans la base de données !");
        }

        return jours.stream()
                .filter(j -> j.getEmploye() != null || j.getTypeDeJour() == TypeDeJour.JF || j.getTypeDeJour() == TypeDeJour.FH) // 🔥 Inclure les jours fériés
                .map(this::convertJourToDto)
                .collect(Collectors.toList());
    }

    @Override
    public ResponseEntity<?> ajouterJourFermeture(String jourSemaine) {
        if (jourSemaine == null || jourSemaine.isBlank()) {
            return ResponseEntity.badRequest().body(new ApiExceptionResponse(400, "⛔ Champ 'jourDeLaSemaine' manquant"));
        }

        String jourUpper = jourSemaine.toUpperCase();

        // ✅ Vérifie si ce jour est un jour férié (en général)
        boolean estFerie = jourFerieRepository.findAll().stream()
                .anyMatch(jf -> {
                    LocalDate date = jf.getDate().toLocalDate();
                    return date.getDayOfWeek().toString().equals(jourUpper);
                });

        if (estFerie) {
            return ResponseEntity.badRequest().body(new ApiExceptionResponse(400, "❌ Ce jour est déjà un jour férié"));
        }

        // ✅ Vérifie si déjà en base
        if (fermetureRepository.existsByJourDeLaSemaineIgnoreCase(jourSemaine)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new ApiExceptionResponse(409, "⚠️ Ce jour est déjà défini comme jour de fermeture"));
        }

        // ✅ Ajout côté jours_fermeture_reguliers
        JoursFermetureReguliers jourFermeture = new JoursFermetureReguliers();
        jourFermeture.setJourDeLaSemaine(jourSemaine.toLowerCase());
        fermetureRepository.save(jourFermeture);

        // ✅ Ajout côté table jour (génération d’un "Jour" pour tous les prochains jours correspondants dans l’année)
        LocalDate currentDate = LocalDate.now();
        LocalDate endDate = currentDate.plusYears(1);
        DayOfWeek dayToAdd = convertirEnDayOfWeek(jourSemaine); // ✅ version sécurisée

        while (!currentDate.isAfter(endDate)) {
            if (currentDate.getDayOfWeek().equals(dayToAdd)) {
                Date sqlDate = Date.valueOf(currentDate);

                // ❗ Ne pas écraser un jour déjà présent (par exemple un jour férié)
                boolean alreadyExists = jourRepository.existsByDateDuJourAndTypeDeJour(sqlDate, TypeDeJour.JF);
                if (!alreadyExists) {
                    ajouterJourFermetureRegulier(sqlDate, TypeDeJour.FH);
                }
            }
            currentDate = currentDate.plusDays(1);
        }

        return ResponseEntity.ok(new ApiResponse<>(200, "✅ Jour de fermeture ajouté avec succès"));
    }

    @Transactional
    @Override
    public void supprimerTousLesJoursFermeture() {
        fermetureRepository.deleteAll(); // suppression JoursFermetureReguliers
        jourRepository.deleteAllByTypeDeJour(TypeDeJour.FH); // suppression dans Jour
    }

    @Transactional
    @Override
    public ResponseEntity<?> supprimerJourFermeture(String jourTexte) {
        JoursFermetureReguliers fermeture = fermetureRepository.findByJourDeLaSemaineIgnoreCase(jourTexte);
        if (fermeture == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiExceptionResponse(404, "❌ Jour non trouvé"));
        }

        // 🔥 Supprimer d'abord de la table des fermetures régulières
        fermetureRepository.delete(fermeture);

        // 🔁 Puis supprimer les lignes FH de la table 'jour' pour l’année à venir
        DayOfWeek jourAEnlever;
        try {
            jourAEnlever = DayOfWeek.valueOf(jourTexte.toUpperCase());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(new ApiExceptionResponse(400, "⛔ Jour invalide : " + jourTexte));
        }

        LocalDate now = LocalDate.now();
        LocalDate end = now.plusYears(1);

        List<Jour> joursASupprimer = jourRepository.findAll().stream()
                .filter(jour -> {
                    LocalDate date = jour.getDateDuJour().toLocalDate();
                    return !date.isBefore(now)
                            && !date.isAfter(end)
                            && date.getDayOfWeek().equals(jourAEnlever)
                            && jour.getTypeDeJour() == TypeDeJour.FH;
                })
                .toList();

        jourRepository.deleteAll(joursASupprimer);

        return ResponseEntity.ok(new ApiResponse<>(200, "✅ Jour de fermeture supprimé avec succès et jours associés retirés"));
    }

    // ✅ Ajouter un jour de fermeture général (pour tout le salon)
    private void ajouterJourFermetureRegulier(Date date, TypeDeJour typeDeJour) {
        Jour jour = new Jour();
        jour.setDateDuJour(date);
        jour.setTypeDeJour(typeDeJour);
        jour.setEmploye(null);
        jour.setHeureDebut(Time.valueOf("00:00:00"));
        jour.setHeureFin(Time.valueOf("00:00:00"));
        jourRepository.save(jour);
    }

    private void ajouterJourDeTravail(Date date, Employe employe) {
        // 🛑 Ne pas ajouter si un FH ou JF existe déjà à cette date
        boolean jourGlobalExiste = jourRepository.existsByDateDuJourAndTypeDeJour(date, TypeDeJour.FH)
                || jourRepository.existsByDateDuJourAndTypeDeJour(date, TypeDeJour.JF);

        if (jourGlobalExiste) {
            System.out.println("❌ Jour global déjà existant (FH ou JF) pour " + date + " → on skip pour employé " + employe.getId());
            return;
        }

        if (jourRepository.existsByDateDuJourAndEmploye(date, employe)) {
            System.out.println("⚠️ Un jour de travail existe déjà pour l'employé " + employe.getId() + " à la date " + date);
            return;
        }

        Jour jour = new Jour();
        jour.setDateDuJour(date);
        jour.setTypeDeJour(TypeDeJour.T);
        jour.setEmploye(employe);
        jour.setHeureDebut(Time.valueOf("09:00:00"));
        jour.setHeureFin(Time.valueOf("18:00:00"));
        jourRepository.save(jour);
        System.out.println("✅ Jour de travail ajouté pour l'employé : " + employe.getId() + " → " + date);
    }

    @Transactional
    public void ajouterJourFerie(LocalDate date) {
        Date sqlDate = Date.valueOf(date);

        // 🔍 Vérifier si ce jour existe déjà dans `JoursFerie`
        if (jourFerieRepository.existsByDate(sqlDate)) {
            throw new BadRequestException("⚠️ Ce jour férié existe déjà dans la base !");
        }

        // ✅ Ajouter le jour férié dans `JoursFerie`
        JoursFerie jourFerie = new JoursFerie();
        jourFerie.setDate(sqlDate);
        jourFerie = jourFerieRepository.saveAndFlush(jourFerie);  // 🔥 `saveAndFlush` force l'écriture immédiate

        System.out.println("✅ Jour férié ajouté dans `JoursFerie`: " + jourFerie.getId());

        // 🔍 Vérifier si un jour existe déjà dans `Jour` pour cette date
        List<Jour> joursExistant = jourRepository.findAllByDateDuJour(sqlDate);

        if (!joursExistant.isEmpty()) {
            for (Jour jour : joursExistant) {
                // 🔥 Si c'est un jour de travail (T), on le transforme en JF
                if (jour.getTypeDeJour() == TypeDeJour.T) {
                    jour.setTypeDeJour(TypeDeJour.JF);
                    jour.setHeureDebut(Time.valueOf("00:00:00"));
                    jour.setHeureFin(Time.valueOf("00:00:00"));
                    jourRepository.save(jour);
                    System.out.println("🔄 Jour transformé en jour férié dans `Jour` pour employé ID: " + (jour.getEmploye() != null ? jour.getEmploye().getId() : "NULL"));
                } else {
                    throw new BadRequestException("⚠️ Impossible de modifier ce jour ! Il est déjà occupé par un congé ou autre type.");
                }
            }
        } else {
            // 🔥 Ajouter un jour férié pour cette date si aucun autre jour n'existe
            ajouterJourFermetureRegulier(sqlDate, TypeDeJour.JF);
            System.out.println("✅ Jour férié ajouté dans `Jour` !");
        }
    }

    // Supprimer un jour férié
    @Override
    public void supprimerJourFerie(Long jourFerieId) {
        System.out.println("🔄 Tentative de suppression du jour férié ID = " + jourFerieId);

        // ✅ Étape 1 : Vérifier si le jour férié existe
        JoursFerie ferie = jourFerieRepository.findById(jourFerieId)
                .orElseThrow(() -> new NotFoundException("❌ Jour férié introuvable avec l'ID : " + jourFerieId));

        Date dateFerie = ferie.getDate();
        System.out.println("📅 Date ciblée pour suppression du jour férié : " + dateFerie);

        // ✅ Étape 2 : Supprimer l'entrée dans la table jours_ferie
        jourFerieRepository.delete(ferie);
        System.out.println("🗑️ Supprimé de la table jours_ferie");

        // ✅ Étape 3 : Trouver tous les jours liés à cette date (typeDeJour = JF)
        List<Jour> jours = jourRepository.findAllByDateDuJour(dateFerie);

        if (jours.isEmpty()) {
            System.out.println("⚠️ Aucun jour trouvé à cette date dans la table `jour`");
        }

        // ✅ Étape 4 : Modifier le type et horaires des jours concernés
        for (Jour jour : jours) {
            if (jour.getTypeDeJour() == TypeDeJour.JF) {
                jour.setTypeDeJour(TypeDeJour.T);
                jour.setHeureDebut(Time.valueOf("09:00:00"));
                jour.setHeureFin(Time.valueOf("18:00:00"));
                jourRepository.save(jour);
                System.out.println("🔁 Jour mis à jour : " + jour.getDateDuJour() + " (-> T)");
            }
        }
        jourRepository.flush();

        System.out.println("✅ Suppression complète terminée pour la date " + dateFerie);
    }

    @Override
    public ResponseEntity<?> ajouterJourConge(Long employeId, Date date, TypeDeJour typeDeJour, boolean matin) {
        // 🔍 Vérifier si la date est dans le passé
        if (date.before(Date.valueOf(LocalDate.now()))) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiExceptionResponse(400, "⚠️ Impossible d'ajouter un congé dans le passé !"));
        }

        Employe employe = employeRepository.findById(employeId)
                .orElseThrow(() -> new NotFoundException("❌ Employé non trouvé ID : " + employeId));

        // 🔍 Vérifier si la date est un jour férié
        if (jourFerieRepository.existsByDate(date)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiExceptionResponse(400, "⚠️ Impossible d'ajouter un congé sur un jour férié !"));
        }

        // 🔍 Vérifier s’il existe déjà un jour pour cette date/employé
        Optional<Jour> jourExistantOpt = jourRepository.findByDateDuJourAndEmploye(date, employe).stream().findFirst();

        // 🔥 Définir les horaires selon type de jour
        Time heureDebutConge, heureFinConge;
        if (typeDeJour == TypeDeJour.DC) {
            if (matin) {
                heureDebutConge = Time.valueOf("09:00:00");
                heureFinConge = Time.valueOf("13:30:00");
            } else {
                heureDebutConge = Time.valueOf("13:30:00");
                heureFinConge = Time.valueOf("18:00:00");
            }
        } else {
            heureDebutConge = Time.valueOf("09:00:00");
            heureFinConge = Time.valueOf("18:00:00");
        }

        // 🔍 Vérifier s’il y a un RDV pendant ce créneau
        boolean rdvAffectes = rendezVousRepository.existsByEmployeIdAndDateAndHeure(
                employeId, date, heureDebutConge, heureFinConge
        );
        if (rdvAffectes) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiExceptionResponse(400, "⚠️ Un rendez-vous existe déjà sur ce créneau !"));
        }

        // 🔁 Mise à jour si un jour existe
        if (jourExistantOpt.isPresent()) {
            Jour jourExistant = jourExistantOpt.get();
            TypeDeJour typeActuel = jourExistant.getTypeDeJour();

            // ❌ On ne modifie pas un jour férié ou un jour de fermeture
            if (typeActuel == TypeDeJour.JF || typeActuel == TypeDeJour.FH) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new ApiExceptionResponse(400, "❌ Impossible de modifier un jour férié ou de fermeture !"));
            }

            // ✅ Sinon, on met à jour le type et les heures
            jourExistant.setTypeDeJour(typeDeJour);
            jourExistant.setHeureDebut(heureDebutConge);
            jourExistant.setHeureFin(heureFinConge);
            jourRepository.save(jourExistant);

            return ResponseEntity.ok(new ApiExceptionResponse(200, "✅ Jour mis à jour avec succès !"));
        }

        // ✅ Création si aucun jour n'existe
        Jour nouveauJour = new Jour();
        nouveauJour.setDateDuJour(date);
        nouveauJour.setEmploye(employe);
        nouveauJour.setTypeDeJour(typeDeJour);
        nouveauJour.setHeureDebut(heureDebutConge);
        nouveauJour.setHeureFin(heureFinConge);
        jourRepository.save(nouveauJour);

        return ResponseEntity.ok(new ApiExceptionResponse(200, "✅ Jour de congé ajouté avec succès !"));
    }

    @Override
    public void supprimerJourConge(Long jourId) {
        Optional<Jour> jourOpt = jourRepository.findById(jourId);

        if (jourOpt.isPresent()) {
            Jour jour = jourOpt.get();

            // 🚨 Empêcher la suppression des jours fixes et des jours de travail
            if (jour.getTypeDeJour() == TypeDeJour.FH || jour.getTypeDeJour() == TypeDeJour.JF || jour.getTypeDeJour() == TypeDeJour.T) {
                throw new BadRequestException("⚠️ Impossible de supprimer un jour férié, une fermeture hebdomadaire ou un jour de travail !");
            }

            // ✅ Si c'est un congé (JC ou DC), transformer en jour de travail (T)
            if (jour.getTypeDeJour() == TypeDeJour.JC || jour.getTypeDeJour() == TypeDeJour.DC) {
                jour.setTypeDeJour(TypeDeJour.T);
                jour.setHeureDebut(Time.valueOf("09:00:00")); // Début matinée
                jour.setHeureFin(Time.valueOf("18:00:00")); // Fin de journée
                jourRepository.save(jour);
                return;
            }

            // ✅ Pour tous les autres cas (s'il y en a), supprimer
            jourRepository.deleteById(jourId);
        } else {
            throw new NotFoundException("❌ Jour non trouvé !");
        }
    }
    public List<ServiceRendezVous> getServicesByRendezVous(RendezVous rdv) {
    return serviceRendezVousRepository.findByRendezVous(rdv);
}

    @Override
    public EmployeDto employeDetailParId(Long employeId) {
        return convertEmplToDto(this.employeRepository.findById(employeId).get());
    }

    @Override
    public EmployeDto employeDetailParEmail(String email) {
        return convertEmplToDto(this.employeRepository.findEmployeByEmail(email));
    }

    @Override
    public List<RendezVousDto> getEmployeeRendezVous(Long employeId) {
        List<RendezVous> rendezVous = this.rendezVousRepository.findAllRendezVousByEmployeId(employeId).orElseThrow(() -> new NotFoundException("User not found : " + employeId));
        return rendezVous.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    @Override
    public List<JourDto> getJourEmploye(Long employeId) {
        List<Jour> jourList = this.jourRepository.findAllByEmployeId(employeId).orElseThrow(() -> new NotFoundException("User not found : " + employeId));
        return jourList.stream().map(this::convertJourToDto).collect(Collectors.toList());
    }

    @Override
    public List<EmployeDto> getAllEmploye() {
        List<Employe> employes = this.employeRepository.findAll();
        return employes.stream().map(this::convertEmplToDto).collect(Collectors.toList());
    }

    public boolean verifierConflitsRendezVous(Long employeId, Date date) {
        List<RendezVous> rendezVousList = rendezVousRepository.findByEmployeIdAndDate(employeId, date);

        // Si des rendez-vous existent à cette date, retourner un message d'erreur
        return !rendezVousList.isEmpty();
    }

    @Override
    public ResponseEntity<?> prendreRendezVousPourClientSansCompte(ClientDto clientDto, RendezVousDto rendezVousDto, List<Long> serviceIds) {
        System.out.println("📦 clientDto reçu : " + clientDto);
        System.out.println("📞 téléphone : " + (clientDto != null ? clientDto.getNumeroTelephone() : "null"));

        // 1️⃣ Vérification des infos client
        if (clientDto == null || clientDto.getNumeroTelephone() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiExceptionResponse(400, "❌ Les informations du client sont incomplètes ou manquantes."));
        }

        AppClient client = getOrCreateClient(clientDto);
        rendezVousDto.setClientDto(modelMapper.map(client, ClientDto.class));

        // 2️⃣ Récupération de l'employé
        Long employeId = rendezVousDto.getEmployeDto().getId();
        Optional<Employe> employeOpt = employeRepository.findById(employeId);

        if (employeOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiExceptionResponse(404, "❌ Employé non trouvé avec ID : " + employeId));
        }

        Employe employe = employeOpt.get();

        // 3️⃣ Conversion de la date
        LocalDate localDate = rendezVousDto.getDate().toLocalDate();
        java.sql.Date sqlDate = java.sql.Date.valueOf(localDate);
        Time heureRdv = rendezVousDto.getHeure();
        Time dureeRdv = rendezVousDto.getDuree();

        // 🔐 Vérification que la date n'est pas dans le passé
        if (sqlDate.before(Date.valueOf(LocalDate.now()))) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiExceptionResponse(400, "❌ Impossible de prendre un rendez-vous dans le passé !"));
        }
        
        // ✅ Récupérer les jours de fermeture réguliers depuis la base
List<DayOfWeek> joursFermes = fermetureRepository.findAll().stream()
        .map(j -> convertirEnDayOfWeek(j.getJourDeLaSemaine()))
        .collect(Collectors.toList());

// ✅ Récupérer les jours fériés ponctuels
List<LocalDate> joursFeries = jourFerieRepository.findAll().stream()
        .map(jf -> jf.getDate().toLocalDate())
        .collect(Collectors.toList());

// ✅ Calcul de la date limite à 14 jours ouvrables
int joursOuvrables = 0;
LocalDate cursor = LocalDate.now();

while (joursOuvrables < 14) {
    cursor = cursor.plusDays(1);
    DayOfWeek jour = cursor.getDayOfWeek();

    boolean estFerie = joursFeries.contains(cursor);
    boolean estFerme = joursFermes.contains(jour);

    if (!estFerme && !estFerie) {
        joursOuvrables++;
    }
}

// ❌ Refus si la date du RDV dépasse la limite
if (localDate.isAfter(cursor)) {
    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(new ApiExceptionResponse(
                    400,
                    "⚠️ Vous ne pouvez enregistrer un rendez-vous que dans les 14 jours ouvrables à venir (hors jours fériés et jours de fermeture)."
            ));
}


        // 4️⃣ Vérification du jour de travail
        Optional<Jour> jourTravailOpt = jourRepository.findFirstByDateDuJourAndEmployeAndTypeDeJour(sqlDate, employe, TypeDeJour.T);
        if (jourTravailOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiExceptionResponse(400, "❌ L'employé ne travaille pas ce jour-là !"));
        }

        Jour jourTravail = jourTravailOpt.get();

        // 5️⃣ Vérifier que l’heure est dans la plage horaire
        if (heureRdv.before(jourTravail.getHeureDebut()) || heureRdv.after(jourTravail.getHeureFin())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiExceptionResponse(400, "❌ L'heure du rendez-vous est en dehors des horaires de travail !"));
        }
        // 🔐 Nouveau : Vérification que le RDV ne dépasse pas l'heure de fermeture
        LocalTime heureDebut = heureRdv.toLocalTime();
        LocalTime heureFin = heureDebut.plusMinutes(dureeRdv.toLocalTime().getHour() * 60 + dureeRdv.toLocalTime().getMinute());
        LocalTime finTravail = jourTravail.getHeureFin().toLocalTime();

        if (heureFin.isAfter(finTravail)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiExceptionResponse(400, "❌ Le rendez-vous dépasse les horaires de fermeture de l'employé !"));
        }

        // 6️⃣ Conflits d’agenda
        if (!isClientDisponible(client.getId(), sqlDate, heureRdv, dureeRdv)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiExceptionResponse(400, "❌ Le client est déjà occupé à cette heure !"));
        }

        if (!isEmployeDisponible(employe.getId(), sqlDate, heureRdv, dureeRdv)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiExceptionResponse(400, "❌ L'employé est déjà occupé à cette heure !"));
        }

        // 7️⃣ Création du rendez-vous
        RendezVous rendezVous = new RendezVous();
        rendezVous.setClient(client);
        rendezVous.setEmploye(employe);
        rendezVous.setDate(sqlDate);
        rendezVous.setHeure(heureRdv);
        rendezVous.setDuree(dureeRdv);
        rendezVous = rendezVousRepository.save(rendezVous);

        // 8️⃣ Associer les services
        if (serviceIds == null || serviceIds.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiExceptionResponse(400, "❌ Aucun service sélectionné !"));
        }

        for (Long serviceId : serviceIds) {
            ServiceRendezVous srv = new ServiceRendezVous();
            srv.setRendezVous(rendezVous);
            AppService service = new AppService();
            service.setId(serviceId);
            srv.setServices(service);
            serviceRendezVousRepository.save(srv);
        }

        // 9️⃣ Mise à jour dynamique du jour
        Time heureFinRdv = Time.valueOf(heureRdv.toLocalTime().plusMinutes(dureeRdv.toLocalTime().getMinute()));

        if (heureRdv.equals(jourTravail.getHeureDebut())) {
            jourTravail.setHeureDebut(heureFinRdv);
        } else if (heureFinRdv.equals(jourTravail.getHeureFin())) {
            jourTravail.setHeureFin(heureRdv);
        }

        jourRepository.save(jourTravail);

        // 🔚 Succès
        return ResponseEntity.ok(new ApiResponse<>(200, "✅ Rendez-vous créé avec succès !"));
    }
    @Override
public AppClient getClientByTelephone(String tel) {
    return clientRepository.findByNumeroTelephone(tel);
}
@Override
public List<ClientDto> searchClients(String query) {
    List<AppClient> clients = clientRepository
        .findByNomContainingIgnoreCaseOrPrenomContainingIgnoreCaseOrNumeroTelephoneContainingIgnoreCase(
            query, query, query
        );

    return clients.stream().map(c -> {
        ClientDto dto = new ClientDto(c.getNom(), c.getPrenom(), c.getEmail(), c.getNumeroTelephone());
        dto.setId(c.getId());
        return dto;
    }).collect(Collectors.toList());
}





    private AppClient getOrCreateClient(ClientDto clientDto) {
        AppClient existing = clientRepository.findByEmail(clientDto.getEmail());
        if (existing != null) {
            System.out.println("⚠️ Client déjà existant avec l'email : " + clientDto.getEmail());
            return existing;
        }

        AppClient client = new AppClient();
        client.setNom(clientDto.getNom());
        client.setPrenom(clientDto.getPrenom());
        client.setEmail(clientDto.getEmail());
        client.setNumeroTelephone(clientDto.getNumeroTelephone());
        client.setMotDePasse("yes"); // Pas de compte
        client.setRole(Role.CLIENT);

        AppClient saved = clientRepository.save(client);
        System.out.println("✅ Nouveau client enregistré avec ID : " + saved.getId());

        return saved;
    }

   RendezVousDto convertToDto(RendezVous rendezVous) {
    RendezVousDto rendezVousDto = this.modelMapper.map(rendezVous, RendezVousDto.class);

    // 🔒 Sécuriser client
    if (rendezVous.getClient() != null) {
        ClientDto clientDto = this.modelMapper.map(rendezVous.getClient(), ClientDto.class);
        rendezVousDto.setClientDto(clientDto);
    } else {
        System.out.println("⚠️ RDV sans client détecté (ID: " + rendezVous.getId() + ")");
        rendezVousDto.setClientDto(null); // ou un DTO vide si nécessaire
    }

    // 🔒 Sécuriser employé
    if (rendezVous.getEmploye() != null) {
        EmployeDto employeDto = this.modelMapper.map(rendezVous.getEmploye(), EmployeDto.class);
        rendezVousDto.setEmployeDto(employeDto);
    } else {
        System.out.println("⚠️ RDV sans employé détecté (ID: " + rendezVous.getId() + ")");
        rendezVousDto.setEmployeDto(null);
    }

    // 🔁 Mapper les services
    Set<ServiceRendezVousDto> serviceRendezVousDtos = rendezVous.getServiceRendezVous()
            .stream()
            .map(serviceRendezVous -> {
                ServiceRendezVousDto dto = modelMapper.map(serviceRendezVous, ServiceRendezVousDto.class);

                if (serviceRendezVous.getServices() != null) {
                    dto.setServicesDto(modelMapper.map(serviceRendezVous.getServices(), AppServiceDto.class));
                }

                return dto;
            })
            .collect(Collectors.toSet());

    rendezVousDto.setServiceRendezVousDtos(serviceRendezVousDtos);

    // 💰 Vérifier si une facture est liée
    Optional<Facture> optionalFacture = factureRepository.findByRendezVous(rendezVous);
    if (optionalFacture.isPresent()) {
        Facture facture = optionalFacture.get();
        rendezVousDto.setFactureCreee(true);
        rendezVousDto.setFactureId(facture.getId());
        rendezVousDto.setEstPayee(facture.isEstPayee());
    } else {
        rendezVousDto.setFactureCreee(false);
    }

    return rendezVousDto;
}


    private JourDto convertJourToDto(Jour jour) {
        if (jour == null) {
            throw new IllegalArgumentException("❌ Erreur : L'objet `Jour` est NULL !");
        }

        if (jour.getTypeDeJour() == null) {
            throw new IllegalArgumentException("❌ Erreur : `typeDeJour` est NULL !");
        }

        if (jour.getDateDuJour() == null) {
            throw new IllegalArgumentException("❌ Erreur : `dateDuJour` est NULL !");
        }

        JourDto jourDto = modelMapper.map(jour, JourDto.class);

        // 👉 Employé : facultatif
        if (jour.getEmploye() == null) {
            System.out.println("⚠️ Jour sans employé trouvé (FH ou JF) : " + jour.getDateDuJour());
            jourDto.setEmployeDto(null);
        } else {
            jourDto.setEmployeDto(modelMapper.map(jour.getEmploye(), EmployeDto.class));
        }

        // ✅ Si le jour est JF, on vérifie s'il est encore férié
        if (jour.getTypeDeJour() == TypeDeJour.JF) {
            Optional<JoursFerie> ferieOpt = jourFerieRepository.findByDate(jour.getDateDuJour());

            if (ferieOpt.isPresent()) {
                jourDto.setJourFerieId(ferieOpt.get().getId());
            } else {
                // ❌ Le jour est marqué comme JF mais le jour férié a été supprimé
                // 👉 On le transforme en jour de travail côté DTO
                jourDto.setTypeDeJour("T");

                jourDto.setHeureDebut(Time.valueOf("09:00:00"));
                jourDto.setHeureFin(Time.valueOf("18:00:00"));
                System.out.println("🔁 Correction : jour " + jour.getDateDuJour() + " rebasculé en 'T' dans le DTO");
            }
        }

        return jourDto;
    }

    EmployeDto convertEmplToDto(Employe employe) {
        Set<RendezVousDto> rendezVousDtos = employe.getRendezVous()
                .stream()
                .map(rendezVous -> this.modelMapper.map(rendezVous, RendezVousDto.class))
                .collect(Collectors.toSet());
        List<JourDto> jourDtos = employe.getPlanning().stream().map(jour -> this.modelMapper.map(jour, JourDto.class)).toList();
        EmployeDto employeDto = this.modelMapper.map(employe, EmployeDto.class);
        employeDto.setPlanningDto(jourDtos);
        employeDto.setRendezVousDtos(rendezVousDtos);

        return employeDto;
    }

}
