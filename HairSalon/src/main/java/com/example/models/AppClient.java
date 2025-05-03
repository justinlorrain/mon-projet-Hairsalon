package com.example.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.Set;

@Entity
@DiscriminatorValue("CLIENT")
@Getter @Setter
public class AppClient extends AppUser {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    /*private Long id;*/
    @JsonIgnore
    @OneToMany(mappedBy = "client", fetch = FetchType.LAZY)
    private Set<RendezVous> rendezVous;
}
