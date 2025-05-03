package com.example.repositories;


import com.example.models.AppClient;
import com.example.models.Employe;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface EmployeRepository extends JpaRepository<Employe, Long> {
    Employe findEmployeByEmail(String email);
     @Query("SELECT e FROM user e WHERE e.role = 'EMPLOYE'") // 🔥 Filtrer les employés
    List<Employe> findAllEmployes();
    AppClient findByEmail(String email);

    
}
