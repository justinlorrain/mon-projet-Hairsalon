package com.example.repositories;

import com.example.models.RendezVous;
import com.example.models.ServiceRendezVous;


import org.springframework.stereotype.Repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

@Repository
public interface ServiceRendezVousRepository extends JpaRepository<ServiceRendezVous, Long> {
    List<ServiceRendezVous> findByRendezVous(RendezVous rendezVous);

    public void deleteByRendezVous(RendezVous rendezVous);
}
