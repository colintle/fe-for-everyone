package com.backend.backend.JWT;

import java.util.Date;
import java.util.function.Function;

import javax.crypto.SecretKey;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import com.backend.backend.User.User;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;

@Service
public class JWTService {
    private String secretKey = System.getenv("SECRET_KEY");

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public boolean isValid(String token, UserDetails user) {
        String email = extractUsername(token);
        return (email.equals(user.getUsername())) && !isTokenExpired(token);
    }

    public boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public <T> T extractClaim(String token, Function<Claims, T> resolver) {
        Claims claims = extractAllClaims(token);
        return resolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
         return  Jwts
                 .parserBuilder()
                 .setSigningKey(getSigninKey())
                 .build()
                 .parseClaimsJws(token)
                 .getBody();
    }

    private SecretKey getSigninKey() {
         byte[] keyBytes = Decoders.BASE64URL.decode(secretKey);
         return Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateToken(User user, int time) {
        return Jwts.builder()
                .setSubject(user.getUsername())
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + time))
                .signWith(getSigninKey())
                .claim("username", user.getUsername())
                .claim("name", user.getName())
                .compact();
    }
}
