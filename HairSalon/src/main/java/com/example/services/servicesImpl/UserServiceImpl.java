package com.example.services.servicesImpl;

import com.example.exception.NotFoundException;
import com.example.models.AppUser;
import com.example.models.Role;
import com.example.models.dto.AppUserDto;
import com.example.repositories.UserRepository;
import com.example.services.IUserService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import java.util.List;
import java.util.Map;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserServiceImpl implements IUserService {
    private UserRepository userRepository;
    private ModelMapper modelMapper;
    private PasswordEncoder passwordEncoder;
     @Value("${app.auth.tokenSecret}")
    private String secretKey;

    @Autowired
    public UserServiceImpl(UserRepository userRepository, ModelMapper modelMapper, PasswordEncoder passwordEncoder){
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.modelMapper = modelMapper;
    }
    @Override
    public AppUserDto createUser(AppUser appUser) {
        appUser.setRole(Role.CLIENT);
        AppUser userResp = this.userRepository.save(appUser);
        return convertToDto(userResp);
    }

    @Override
    public AppUserDto updateUser(AppUser appUser, Long userId) {
        AppUser appUser1 = this.userRepository.findById(userId).orElseThrow(() -> new NotFoundException("User not found" + appUser.getEmail()));
        appUser1.setEmail(appUser.getEmail());
        appUser1.setNom(appUser.getNom());
        appUser1.setPrenom(appUser.getPrenom());
        appUser1.setNumeroTelephone(appUser.getNumeroTelephone());

        return convertToDto(this.userRepository.save(appUser1));
    }

    @Override
    public ResponseEntity changePassword(Long id, String oldPass, String newPass) {
        //Check if user exist
        AppUser user = this.userRepository.findById(id).orElseThrow( ()-> new NotFoundException("User not found : "+id));

        //Check if password are the same
        if(!passwordEncoder.matches(oldPass, user.getMotDePasse())){
            return ResponseEntity.badRequest().body("Les mots de passe ne correspondent pas!");
        }

        //Change pass and save
        user.setMotDePasse(passwordEncoder.encode(newPass));
        this.userRepository.save(user);

        return ResponseEntity.ok().body(user);
    }

    @Override
    public AppUserDto findByEmail(String email) {
        return convertToDto(this.userRepository.findByEmail(email).get());
    }
 @Override
    public AppUser getUserFromToken(String authorizationHeader) {
        String token = authorizationHeader.substring(7); // Supprimer "Bearer "
        Claims claims = Jwts.parser().setSigningKey(secretKey).parseClaimsJws(token).getBody();

        AppUser user = new AppUser();
        user.setEmail((String) claims.get("email"));

        // Récupérer les informations à partir de la base de données
       AppUser userFromDb = userRepository.findByEmail(user.getEmail()).orElse(null);
        if (userFromDb != null) {
            user.setId(userFromDb.getId());
            user.setNom(userFromDb.getNom());
            user.setPrenom(userFromDb.getPrenom());
            user.setNumeroTelephone(userFromDb.getNumeroTelephone());
            // Ne récupérez jamais le mot de passe à partir de la base de données pour des raisons de sécurité
        }

        // Récupérer le rôle
        @SuppressWarnings("unchecked")
        List<Map<String, String>> roles = (List<Map<String, String>>) claims.get("role");
        if (roles != null && !roles.isEmpty()) {
            String roleName = roles.get(0).get("authority");
            try {
                user.setRole(Role.valueOf(roleName));
            } catch (IllegalArgumentException e) {
                // Gérer le cas où le rôle est invalide
            }
        }

        return user;
    }
    AppUserDto convertToDto(AppUser appUser) {
        AppUserDto appUserDto = this.modelMapper.map(appUser, AppUserDto.class);
        return appUserDto;
    }
}
