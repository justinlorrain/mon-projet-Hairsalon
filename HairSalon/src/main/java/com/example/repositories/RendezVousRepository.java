package com.example.repositories;

import com.example.models.AppClient;
import com.example.models.Employe;
import com.example.models.RendezVous;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.sql.Time;

import java.util.Date;
import java.util.List;
import java.util.Optional;


@Repository
public interface RendezVousRepository extends JpaRepository<RendezVous, Long> {

    @Query("SELECT rv FROM RendezVous rv WHERE rv.employe = :employe AND rv.date = :date " + "AND (:heure < ADDTIME(rv.heure, rv.duree) AND ADDTIME(:heure, :duree) > rv.heure)")
    //@Query("SELECT rv FROM RendezVous rv WHERE rv.employe = :employe AND rv.date = :date AND rv.duree = :duree AND rv.heure = :heure")
    List<RendezVous> findByEmployeAndDateAndHeureAndDuree(@Param("employe") Employe employe, @Param("date") Date date,
            @Param("heure") Time heure,
            @Param("duree") Time duree);
    @Query("SELECT r FROM RendezVous r WHERE r.employe = :employe AND r.date = :date")
List<RendezVous> findByEmployeAndDate(@Param("employe") Employe employe, @Param("date") Date date);

@Query("SELECT r FROM RendezVous r JOIN FETCH r.client WHERE r.id = :id")
Optional<RendezVous> findByIdWithClient(@Param("id") Long id);

    List<RendezVous> findByEmployeIdAndDate(Long employeId, Date date);

    Optional<RendezVous> findRendezVousByClientId(Long clientId);

    Optional<List<RendezVous>> findAllRendezVousByEmployeId(Long employeId);

    Optional<List<RendezVous>> findAllRendezVousByClientId(Long clientId);

 

    @Query("SELECT r FROM RendezVous r LEFT JOIN FETCH r.client LEFT JOIN FETCH r.employe")
    List<RendezVous> findAllWithClients();
    
    @Query("SELECT CASE WHEN COUNT(r) > 0 THEN TRUE ELSE FALSE END FROM RendezVous r WHERE r.client.id = :clientId AND r.date = :date AND r.heure = :heure")
boolean existsByClientIdAndDateAndHeure(@Param("clientId") Long clientId, @Param("date") Date date, @Param("heure") Time heure);

@Query("SELECT CASE WHEN COUNT(r) > 0 THEN true ELSE false END " +
       "FROM RendezVous r " +
       "WHERE r.client.id = :clientId " +
       "AND r.date = :date " +
       "AND (" +
       "    (:heure < ADDTIME(r.heure, r.duree) AND ADDTIME(:heure, :duree) > r.heure) " +
       "    OR " +
       "    (r.heure < ADDTIME(:heure, :duree) AND ADDTIME(r.heure, r.duree) > :heure)" +
       ")")
boolean existsByClientIdAndDateAndChevauchement(
    @Param("clientId") Long clientId,
    @Param("date") Date date,
    @Param("heure") Time heure,
    @Param("duree") Time duree);

@Query("SELECT r FROM RendezVous r WHERE r.client.id = :clientId AND r.date = :date")
List<RendezVous> findByClientIdAndDate(@Param("clientId") Long clientId, @Param("date") Date date);

@Query("SELECT r FROM RendezVous r WHERE r.client.id = :clientId AND r.date = :date ORDER BY r.heure ASC")
List<RendezVous> findByClientIdAndDateOrderByHeureAsc(@Param("clientId") Long clientId, @Param("date") Date date);



@Query("SELECT COUNT(r) > 0 FROM RendezVous r " +
       "WHERE r.employe.id = :employeId " +
       "AND r.client.id = :clientId " +
       "AND r.date = :date")
boolean existsByEmployeIdAndClientIdAndDate(@Param("employeId") Long employeId,
                                            @Param("clientId") Long clientId,
                                            @Param("date") Date date);

@Query("SELECT COUNT(r) > 0 FROM RendezVous r " +
       "WHERE r.employe.id = :employeId " +
       "AND r.client.id = :clientId " +
       "AND r.id <> :rendezVousId")  // Exclure le RDV en cours de modification
boolean existsByEmployeIdAndClientId(@Param("employeId") Long employeId,
                                     @Param("clientId") Long clientId,
                                     @Param("rendezVousId") Long rendezVousId);



@Query("SELECT COUNT(r) > 0 FROM RendezVous r " +
       "WHERE r.employe.id = :employeId " +
       "AND r.client.id = :clientId " +
       "AND r.id <> :rendezVousId") // Exclut le RDV en cours
boolean existsByEmployeIdAndClientIdExcluantRdv(@Param("employeId") Long employeId, 
                                                @Param("clientId") Long clientId, 
                                                @Param("rendezVousId") Long rendezVousId);
@Query("SELECT COUNT(r) > 0 FROM RendezVous r " +
       "WHERE (r.client.id = :clientId OR r.employe.id = :employeId) " +  
       "AND DATE(r.date) = DATE(:date) " +  
       "AND r.id <> :rendezVousId " +  
       "AND ( " +
       "  (:heure >= r.heure AND :heure < ADDTIME(r.heure, r.duree)) OR " +  
       "  (ADDTIME(:heure, :duree) > r.heure AND ADDTIME(:heure, :duree) <= ADDTIME(r.heure, r.duree)) OR " +  
       "  (r.heure BETWEEN :heure AND ADDTIME(:heure, :duree)) OR " +  
       "  (:heure <= r.heure AND ADDTIME(:heure, :duree) >= ADDTIME(r.heure, r.duree)) " +  
       ")")
boolean existsByClientOrEmployeAndDateAndChevauchement(@Param("clientId") Long clientId, 
                                                       @Param("employeId") Long employeId, 
                                                       @Param("date") Date date,
                                                       @Param("heure") Time heure,
                                                       @Param("duree") Time duree,
                                                       @Param("rendezVousId") Long rendezVousId);
@Query("SELECT COUNT(r) > 0 FROM RendezVous r " +
       "WHERE r.employe.id = :employeId " +
       "AND DATE(r.date) = DATE(:date) " +
       "AND ( " +
       "  (r.heure >= :heureDebut AND r.heure < :heureFin) OR " +  
       "  (ADDTIME(r.heure, r.duree) > :heureDebut AND ADDTIME(r.heure, r.duree) <= :heureFin) OR " +  
       "  (:heureDebut <= r.heure AND :heureFin >= ADDTIME(r.heure, r.duree)) " +  
       ")")
boolean existsByEmployeIdAndDateAndHeure(@Param("employeId") Long employeId, 
                                         @Param("date") Date date,
                                         @Param("heureDebut") Time heureDebut,
                                         @Param("heureFin") Time heureFin);


@Query("SELECT COUNT(r) > 0 FROM RendezVous r " +
       "WHERE r.employe.id = :employeId " +
       "AND DATE(r.date) = DATE(:date) " +
       "AND ( " +
       "  (r.heure BETWEEN :nouvelleHeureDebut AND :nouvelleHeureFin) " +  // RDV dans le créneau
       "  OR (ADDTIME(r.heure, r.duree) BETWEEN :nouvelleHeureDebut AND :nouvelleHeureFin) " +  // Fin RDV dans le créneau
       "  OR (:nouvelleHeureDebut BETWEEN r.heure AND ADDTIME(r.heure, r.duree)) " +  // Créneau englobe un RDV
       ")")
boolean existsByEmployeIdAndDateAndEnDehorsDuNouvelHoraire(
    @Param("employeId") Long employeId, 
    @Param("date") Date date,
    @Param("nouvelleHeureDebut") Time nouvelleHeureDebut,
    @Param("nouvelleHeureFin") Time nouvelleHeureFin
);

/*@Query("""
    SELECT COUNT(r) > 0
    FROM RendezVous r
    WHERE r.employe.id = :employeId
      AND DATE(r.date) = DATE(:date)
      AND (
           (r.heure < :nouvelleHeureFin AND ADDTIME(r.heure, r.duree) > :nouvelleHeureDebut)
      )
""")
boolean existsByEmployeIdAndDateAndEnDehorsDuNouvelHoraire(
    @Param("employeId") Long employeId,
    @Param("date") Date date,
    @Param("nouvelleHeureDebut") Time nouvelleHeureDebut,
    @Param("nouvelleHeureFin") Time nouvelleHeureFin
);*/


List<RendezVous> findByClientAndDate(AppClient  client, Date date);
/*@Query("SELECT r FROM RendezVous r LEFT JOIN FETCH r.client LEFT JOIN FETCH r.employe LEFT JOIN FETCH r.serviceRendezVous srv LEFT JOIN FETCH srv.services WHERE r.date BETWEEN :start AND :end")
List<RendezVous> findByDateBetweenWithDetails(@Param("start") Date start, @Param("end") Date end);*/

@Query("SELECT r FROM RendezVous r " +
       "LEFT JOIN FETCH r.client " +
       "LEFT JOIN FETCH r.employe " +
       "LEFT JOIN FETCH r.serviceRendezVous srv " +
       "LEFT JOIN FETCH srv.services " +
       "WHERE r.date BETWEEN :start AND :end")
List<RendezVous> findByDateBetweenWithDetails(@Param("start") Date start, @Param("end") Date end);

@Query("""
    SELECT r FROM RendezVous r
    WHERE r.employe.id = :employeId
    AND DATE(r.date) = DATE(:date)
    AND (
        (r.heure < :heureDebut OR ADDTIME(r.heure, r.duree) > :heureFin)
    )
""")
List<RendezVous> findByEmployeIdAndDateAndEnDehorsDuNouvelHoraire(
    @Param("employeId") Long employeId,
    @Param("date") Date date,
    @Param("heureDebut") Time heureDebut,
    @Param("heureFin") Time heureFin
);

List<RendezVous> findByDate(Date date);

@Query(value = """
  SELECT COUNT(*) FROM rendez_vous r
  WHERE r.id <> :rendezVousId
    AND (r.employe_id = :employeId OR r.client_id = :clientId)
    AND r.date = :date
    AND (
      (r.heure <= :heure AND ADDTIME(r.heure, SEC_TO_TIME(:duree * 60)) > :heure) OR
      (:heure <= r.heure AND ADDTIME(:heure, SEC_TO_TIME(:duree * 60)) > r.heure)
    )
""", nativeQuery = true)
Long countOverlappingRdv(
  @Param("clientId") Long clientId,
  @Param("employeId") Long employeId,
  @Param("date") Date date,
  @Param("heure") Time heure,
  @Param("duree") int duree,
  @Param("rendezVousId") Long rendezVousId
);


}
