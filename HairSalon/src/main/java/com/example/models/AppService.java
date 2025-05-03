package com.example.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.sql.Time;
import java.time.Duration;
import java.util.Set;

@Entity(name = "service")  // Assure-toi que le nom correspond bien à la table en BDD
@Getter
@Setter
public class AppService {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String nom;
    private double montant;
    private Time duree;
    private String devise;
     @JsonIgnore
    @OneToMany(mappedBy = "services")
    private Set<ServiceRendezVous> serviceRendezVous;

    // ✅ Constructeur par défaut requis pour Hibernate
    public AppService() {
        // Constructeur vide nécessaire pour JPA/Hibernate
    }

    // ✅ Constructeur avec paramètres
    public AppService(String nom, Duration duree, double montant, String devise) {
        this.nom = nom;
        this.duree = Time.valueOf(duree.toString()); // Assure-toi que le type est bien converti
        this.montant = montant;
        this.devise = devise;
    }
}
