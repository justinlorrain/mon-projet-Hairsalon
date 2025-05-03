package com.example.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.Set;

@Entity
@DiscriminatorValue("EMPLOYE")
@Getter @Setter
public class Employe extends AppUser {

    @OneToMany(mappedBy = "employe")
    private Set<RendezVous> rendezVous;

    @OneToMany(mappedBy = "employe", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Jour> planning;

}
