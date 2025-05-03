package com.example.repositories;

import com.example.models.AppService;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ServiceRepository extends JpaRepository<AppService, Long> {

}
