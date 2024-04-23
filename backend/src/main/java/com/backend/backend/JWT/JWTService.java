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
    private String access = System.getenv("ACCESS_KEY");
    private String refresh = System.getenv("REFRESH_KEY");

    public String extractUsername(String token, boolean cookie) {
        return extractClaim(token, Claims::getSubject, cookie);
    }

    public boolean isValid(String token, UserDetails user, boolean cookie) {
        String email = extractUsername(token, cookie);
        return (email.equals(user.getUsername())) && !isTokenExpired(token, cookie);
    }

    public boolean isTokenExpired(String token, boolean cookie) {
        return extractExpiration(token, cookie).before(new Date());
    }

    private Date extractExpiration(String token, boolean cookie) {
        return extractClaim(token, Claims::getExpiration, cookie);
    }

    public <T> T extractClaim(String token, Function<Claims, T> resolver, boolean cookie) {
        Claims claims = extractAllClaims(token, cookie);
        return resolver.apply(claims);
    }

    private Claims extractAllClaims(String token, boolean cookie) {
         return  Jwts
                 .parserBuilder()
                 .setSigningKey(cookie ? getSigninRefreshKey() : getSigninAccessKey())
                 .build()
                 .parseClaimsJws(token)
                 .getBody();
    }

    private SecretKey getSigninAccessKey() {
         byte[] keyBytes = Decoders.BASE64URL.decode(access);
         return Keys.hmacShaKeyFor(keyBytes);
    } 

    private SecretKey getSigninRefreshKey() {
        byte[] keyBytes = Decoders.BASE64URL.decode(refresh);
        return Keys.hmacShaKeyFor(keyBytes);
   }

    public String generateToken(User user, int time, boolean cookie) {
        return Jwts.builder()
                .setSubject(user.getUsername())
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + time))
                .signWith(cookie ? getSigninRefreshKey() : getSigninAccessKey())
                .claim("username", user.getUsername())
                .claim("name", user.getName())
                .claim("role", user.getRole())
                .compact();
    }
}
