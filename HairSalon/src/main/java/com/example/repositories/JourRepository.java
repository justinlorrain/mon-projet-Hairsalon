package com.example.repositories;

import com.example.models.Employe;
import com.example.models.Jour;
import com.example.models.TypeDeJour;
import java.sql.Date;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface JourRepository extends JpaRepository<Jour, Long> {
    
    @Query("SELECT j FROM Jour j WHERE j.dateDuJour BETWEEN :start AND :end AND j.employe IS NOT NULL")
List<Jour> findByDateDuJourBetween(@Param("start") Date start, @Param("end") Date end);


    List<Jour> findByEmployeAndDateDuJour(Employe employe, LocalDate dateDuJour);

    Optional<List<Jour>> findAllByEmployeId(Long employeId);
    
    Optional<Jour> findFirstByDateDuJourAndEmployeAndTypeDeJour(Date date, Employe employe, TypeDeJour typeDeJour);


    @Query("SELECT j FROM Jour j WHERE j.dateDuJour = :date AND j.employe = :employe")
    List<Jour> findByDateDuJourAndEmploye(@Param("date") Date date, @Param("employe") Employe employe);
    
    Optional<Jour> findFirstByDateDuJourAndEmploye(Date dateDuJour, Employe employe);


    public boolean existsByDateDuJourAndEmploye(Date date, Employe employe);
    
    boolean existsByDateDuJourAndEmployeAndTypeDeJourIn(Date date, Employe employe, List<TypeDeJour> typesDeJour);
    Optional<Jour> findFirstByDateDuJourAndEmployeAndTypeDeJourIn(Date date, Employe employe, List<TypeDeJour> types);

    
    @Query("SELECT j FROM Jour j")
List<Jour> findAllWithoutLimit();

  // ✅ Vérifier si un jour de type spécifique existe à une date donnée
    boolean existsByDateDuJourAndTypeDeJour(Date dateDuJour, TypeDeJour typeDeJour);

    // ✅ Supprimer tous les jours d'un type spécifique à une date donnée
    @Modifying
    @Transactional
    void deleteByDateDuJourAndTypeDeJour(Date dateDuJour, TypeDeJour typeDeJour);
@Query("SELECT j FROM Jour j WHERE j.dateDuJour = :dateDuJour AND j.typeDeJour = :typeDeJour")
List<Jour> findByDateDuJourAndTypeDeJour(Date dateDuJour, TypeDeJour typeDeJour);
@Query("SELECT j FROM Jour j WHERE j.dateDuJour = :date")
    List<Jour> findAllByDateDuJour(@Param("date") Date date);
    @Modifying
@Transactional
       void deleteAllByTypeDeJour(TypeDeJour typeDeJour);
    
}
