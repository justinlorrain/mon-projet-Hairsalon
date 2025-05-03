/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.example.Rappel;

import com.example.models.AppClient;
import com.example.models.Employe;
import com.example.models.RendezVous;
import com.example.repositories.RendezVousRepository;
import com.example.services.MailService;
import java.sql.Date;
import java.time.LocalDate;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

/**
 *
 * @author justi
 */
@Service
public class RappelRendezVous {
     @Autowired
    private RendezVousRepository rendezVousRepository;

    @Autowired
    private MailService mailService;

    @Scheduled(cron = "0 0 18 * * *") // ⏰ Tous les jours à 18h
    public void envoyerRappels() {
        LocalDate demain = LocalDate.now().plusDays(1);
        Date sqlDateDemain = Date.valueOf(demain);

        List<RendezVous> rdvs = rendezVousRepository.findByDate(sqlDateDemain);

        for (RendezVous rdv : rdvs) {
            AppClient client = rdv.getClient();
            Employe employe = rdv.getEmploye();

            if (client != null && client.getEmail() != null) {
                String contenu = String.format("""
                    Bonjour %s,
                    
                    Petit rappel 😊 : vous avez un rendez-vous demain (%s) à %s avec %s %s.
                    
                    Si vous ne pouvez pas venir, merci de nous prévenir au plus tard ce soir.
                    
                    À très bientôt au salon ✂️
                    
                    -- L’équipe du salon
                    """,
                        client.getPrenom(),
                        rdv.getDate().toString(),
                        rdv.getHeure().toString().substring(0, 5),
                        employe.getPrenom(),
                        employe.getNom()
                );

                mailService.envoyerMail(client.getEmail(), "📅 Rappel de votre rendez-vous", contenu);
            }
        }
    }
}
