package com.example.repositories;


import com.example.models.Facture;
import com.example.models.RendezVous;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FactureRepository extends JpaRepository<Facture, Long> {
boolean existsByRendezVous(RendezVous rendezVous);
Optional<Facture> findByRendezVous(RendezVous rendezVous);

}
