package com.example.repositories;

import com.example.models.AppUser;
import com.example.models.Role;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

@Repository
public interface UserRepository extends JpaRepository<AppUser, Long> {
    Optional<AppUser> findByEmail(String email);
   @Query("SELECT u FROM user u WHERE u.role = :role")  
List<AppUser> findAllEmployes(@Param("role") Role role); // ✅ Correct


@Query("SELECT u FROM user u WHERE u.id = :id AND u.role = 'EMPLOYE'")  // ✅ Utilisez "user"
Optional<AppUser> findEmployeById(@Param("id") Long id);


}
