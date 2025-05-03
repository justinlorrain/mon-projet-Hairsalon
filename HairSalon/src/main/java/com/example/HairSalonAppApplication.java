package com.example;

import com.example.models.Admin;
import com.example.models.AppService;
import com.example.models.AppUser;
import com.example.models.Role;
import com.example.repositories.ServiceRepository;
import com.example.repositories.UserRepository;


import org.modelmapper.ModelMapper;
import org.modelmapper.convention.MatchingStrategies;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.sql.Time;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableJpaRepositories("com.example.repositories")
@EnableScheduling 
public class HairSalonAppApplication extends SpringBootServletInitializer implements CommandLineRunner {

    @Autowired
    private ServiceRepository serviceRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;

    public static void main(String[] args) {
        SpringApplication.run(HairSalonAppApplication.class, args);
    }

    @Override
    protected SpringApplicationBuilder configure(SpringApplicationBuilder application) {
        return application.sources(HairSalonAppApplication.class);
    }

    @Bean
    ModelMapper modelMapper() {
        ModelMapper modelMapper = new ModelMapper();
        modelMapper.getConfiguration().setMatchingStrategy(MatchingStrategies.STANDARD);
        return modelMapper;
    }

    @Override
    public void run(String... args) throws Exception {
        AppUser appUser = new Admin();
        appUser.setEmail("admin@admin.com");
        appUser.setMotDePasse(passwordEncoder.encode("admin"));
        appUser.setPrenom("Admin");
        appUser.setNom("Admin");
        appUser.setNumeroTelephone("+32465979370");
        appUser.setRole(Role.ADMIN);

        if(userRepository.findByEmail(appUser.getEmail()).isEmpty()){
            userRepository.save(appUser);
        }

        if(serviceRepository.count() == 0){
            AppService appService = new AppService();
            appService.setNom("COUPE");
            appService.setDuree(Time.valueOf("00:30:00"));
            appService.setMontant(25.00);
            appService.setDevise("€");
            AppService appService1 = new AppService();
            appService1.setNom("BRUSHING");
            appService1.setDuree(Time.valueOf("00:30:00"));
            appService1.setMontant(25.00);
            appService1.setDevise("€");
            AppService appService2 = new AppService();
            appService2.setNom("COLORATION");
            appService2.setDuree(Time.valueOf("01:00:00"));
            appService2.setMontant(50.00);
            appService2.setDevise("€");
            AppService appService3 = new AppService();
            appService3.setNom("SOINS");
            appService3.setDuree(Time.valueOf("00:45:00"));
            appService3.setMontant(30.00);
            appService3.setDevise("€");

            serviceRepository.save(appService);
            serviceRepository.save(appService1);
            serviceRepository.save(appService2);
            serviceRepository.save(appService3);
        }
        
    }
}