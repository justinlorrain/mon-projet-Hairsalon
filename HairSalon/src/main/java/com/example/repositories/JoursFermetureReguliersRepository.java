/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Interface.java to edit this template
 */
package com.example.repositories;

import com.example.models.JoursFermetureReguliers;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 *
 * @author justi
 */
public interface JoursFermetureReguliersRepository extends JpaRepository<JoursFermetureReguliers, Integer> {
    boolean existsByJourDeLaSemaineIgnoreCase(String jour);
    JoursFermetureReguliers findByJourDeLaSemaineIgnoreCase(String jour);
}

