package com.example.security;





import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.SignatureException;
import io.jsonwebtoken.UnsupportedJwtException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.util.Date;


@Service
@Slf4j
public class TokenProvider {

    @Value("${app.auth.tokenSecret}")
    private String tokenSecret;

    //Recupere le tokenExpirationMsec configurer dans le fichier application.yml
    @Value("${app.auth.tokenExpirationMsec}")
    private long tokenExpirationMsec;

    @Value("${app.auth.refreshTokenExpirationMsec}")
    private long refreshTokenExpirationMsec;

    private CustomUserDetailService customUserDetailService;

    @Autowired
    public TokenProvider(CustomUserDetailService customUserDetailService) {
        this.customUserDetailService = customUserDetailService;
    }

    //Creer le token
    public String createToken(Authentication authentication) {

        //Recupere le Main User Principal
        UserPrincipal mainUserPrincipal = (UserPrincipal) authentication.getPrincipal();

        //Calcul de la date d'expiration du token
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + tokenExpirationMsec);

        //Retourne un token
        return Jwts.builder() //Initialise la constructeur de token
                .setSubject(mainUserPrincipal.getAppUser().getEmail()) //Definir le sujet
                .setIssuedAt(new Date()) // Definir la date de creation du token
                .setExpiration(expiryDate) //Definir la date d'expriration du token
                .signWith(SignatureAlgorithm.HS512, tokenSecret) // Signe le JWT construit à l'aide de l'algorithme spécifié avec la clé spécifiée
                //Definir le corps du JWT
                .claim("id", mainUserPrincipal.getAppUser().getId()) 
                .claim("email", mainUserPrincipal.getAppUser().getEmail()) // Ajout de l'email dans le corps du JWT
                .claim("role", mainUserPrincipal.getAuthorities()) // Ajout du role dans le corps du JWT
                .compact(); //Construit réellement le JWT et le sérialise en une chaîne compacte et sécurisée pour les URL
    }

    public String createRefreshToken(Authentication authentication) {

        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();

        //Calcul de la date d'expiration du token
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + refreshTokenExpirationMsec);

        //Retourne un token
        String refreshToken = Jwts.builder() //Initialise la constructeur de token
                .setSubject(userPrincipal.getAppUser().getEmail()) //Definir le sujet
                .setIssuedAt(new Date()) // Definir la date de creation du token
                .setExpiration(expiryDate) //Definir la date d'expriration du token
                .signWith(SignatureAlgorithm.HS512, tokenSecret) // Signe le JWT construit à l'aide de l'algorithme spécifié avec la clé spécifiée
                //Definir le corps du JWT
                .claim("email", userPrincipal.getAppUser().getEmail()) // Ajout de l'email dans le corps du JWT
                .compact(); //Construit réellement le JWT et le sérialise en une chaîne compacte et sécurisée pour les URL

        log.info("Refresh Token successfully generated: {}", refreshToken);

        return refreshToken;
    }

   public Authentication getAuthentication(String token) {
    Long userId = getUserIdFromToken(token);
    UserDetails userDetails = this.customUserDetailService.loadUserById(userId);
    return new UsernamePasswordAuthenticationToken(userDetails, "", userDetails.getAuthorities());
}

    /**
     * Retourne l'ID de l'utilisateur stocker dans le token
     * grace a la methode setSubject()
     * @param token
     * @return Long
     */
    public String getUserEmailFromToken(String token) {
        Claims claims = Jwts.parser() // Initialisation de l'analyseur du token
                .setSigningKey(tokenSecret) // Definir la cle de signature
                .parseClaimsJws(token) // Analyse la chaîne JWT sérialisée compacte spécifiée en fonction de l'état de configuration actuel du générateur et renvoie l'instance JWT en texte brut non signée résultante.
                .getBody(); // Recupere le corps du token pour le traitement

        return claims.getSubject(); //Retourne le contenu du subject
    }

    public Long getUserIdFromToken(String token) {
    Claims claims = Jwts.parser()
            .setSigningKey(tokenSecret)
            .parseClaimsJws(token)
            .getBody();

    Object idClaim = claims.get("id");

    if (idClaim instanceof Integer) {
        return ((Integer) idClaim).longValue();
    } else if (idClaim instanceof Long) {
        return (Long) idClaim;
    } else {
        throw new IllegalArgumentException("ID introuvable ou de type inattendu");
    }
}


    /**
     * Valide le token et retourne true si tout est bon si non false
     * @param authToken
     * @return boolean
     */
    public boolean validateToken(String authToken) {
        try {
            Jwts.parser().setSigningKey(tokenSecret).parseClaimsJws(authToken);
            return true;
        } catch (SignatureException ex) {
            log.error("Invalid JWT signature");
        } catch (MalformedJwtException ex) {
            log.error("Invalid JWT token");
        } catch (ExpiredJwtException ex) {
            log.error("Expired JWT token");
        } catch (UnsupportedJwtException ex) {
            log.error("Unsupported JWT token");
        } catch (IllegalArgumentException ex) {
            log.error("JWT claims string is empty.");
        }
        return false;
    }
}
