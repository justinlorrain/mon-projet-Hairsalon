package com.example.repositories;

import com.example.models.AppClient;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface ClientRepository extends JpaRepository<AppClient, Long> {
    AppClient findByEmail(String email);
    List<AppClient> findByNomContainingIgnoreCaseAndPrenomContainingIgnoreCase(String nom, String prenom);
List<AppClient> findByNomContainingIgnoreCase(String nom);
List<AppClient> findByPrenomContainingIgnoreCase(String prenom);
AppClient findByNumeroTelephone(String numeroTelephone);
List<AppClient> findByNomContainingIgnoreCaseOrPrenomContainingIgnoreCaseOrNumeroTelephoneContainingIgnoreCase(
    String nom, String prenom, String numero
);


    
}
