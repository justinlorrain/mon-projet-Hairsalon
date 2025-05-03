package com.example.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.sql.Date;
import java.sql.Time;


@Entity
@Getter @Setter
public class Jour {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "date_du_jour", nullable = false)
    private Date dateDuJour;

    @Column(name = "heure_debut", nullable = false)
    private Time heureDebut;

    @Column(name = "heure_fin", nullable = false)
    private Time heureFin;

    @Enumerated(EnumType.STRING)
    private TypeDeJour typeDeJour; // "T", "JC", "DC", "M"
    
   

    @ManyToOne
    private Employe employe;



}
