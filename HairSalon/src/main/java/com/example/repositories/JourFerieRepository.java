package com.example.repositories;

import com.example.models.JoursFerie;
import com.example.models.TypeDeJour;
import java.sql.Date;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface JourFerieRepository extends JpaRepository<JoursFerie, Long> {

    public boolean existsByDate(Date date);
    Optional<JoursFerie> findByDate(Date date);




}
