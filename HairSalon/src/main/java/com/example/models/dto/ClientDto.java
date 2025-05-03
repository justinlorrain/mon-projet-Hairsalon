package com.example.models.dto;




import java.util.Set;

public class ClientDto extends AppUserDto {
    private Long id;
    private Set<RendezVousDto> rendezVousDtos;
     public ClientDto() {
        // Obligatoire pour ModelMapper
    }
   public ClientDto(String nom, String prenom, String email, String numeroTelephone) {
    setNom(nom);
    setPrenom(prenom);
    setEmail(email);
    setNumeroTelephone(numeroTelephone);
}

}
