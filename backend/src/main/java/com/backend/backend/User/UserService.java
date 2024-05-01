package com.backend.backend.User;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.backend.backend.Cookie.CookieUtils;
import com.backend.backend.JWT.JWT;
import com.backend.backend.JWT.JWTService;
import com.backend.backend.JWT.PasswordConstraintValidator;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Service
public class UserService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JWTService jwtService;
    private final AuthenticationManager authenticationManager;
    private final PasswordConstraintValidator passwordConstraintValidator;
    private final UserDetailsServiceImp userDetailsService;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, JWTService jwtService, AuthenticationManager authenticationManager, PasswordConstraintValidator passwordConstraintValidator, UserDetailsServiceImp userDetailsService){
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
        this.passwordConstraintValidator = passwordConstraintValidator;
        this.userDetailsService = userDetailsService;
    }

    public JWT authenticate(User request, HttpServletResponse response) {
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                    request.getUsername(),
                    request.getPassword()
            )
        );

        User user = userRepository.findUserByUsername(request.getUsername()).orElseThrow();
        String token = jwtService.generateToken(user, 24*60*60*1000, false);
        String refreshToken = jwtService.generateToken(user, 7*24*60*60*1000, true);
        CookieUtils.create(response, "refreshToken", refreshToken, true, 86400 * 7); // 7 days and secure

        return new JWT(token, user.getUsername());
    }

    public JWT register(User request, HttpServletResponse response) {
        if (request.getName().isEmpty() || request.getUsername().isEmpty() || request.getPassword().isEmpty()) {
            throw new IllegalArgumentException("Username or password does not meet the requirements.");
        }

        Optional<User> existingUser = userRepository.findUserByUsername(request.getUsername());
        if (existingUser.isPresent()) {
             throw new IllegalArgumentException("Username or password does not meet the requirements.");
        }

        if (!passwordConstraintValidator.isValid(request.getPassword())){
            throw new IllegalArgumentException("Username or password does not meet the requirements.");
        }

        User user = new User();
        user.setName(request.getName());
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        
        user = userRepository.save(user);
        // 24 hour expiration
        String token = jwtService.generateToken(user, 24*60*60*1000, false);
        String refreshToken = jwtService.generateToken(user, 7*24*60*60*1000, true);
        CookieUtils.create(response, "refreshToken", refreshToken, true, 86400 * 7); // 7 days and secure

        return new JWT(token, user.getUsername());
    }

    public Map<String, Object> logout(HttpServletResponse response){
        CookieUtils.clear(response, "refreshToken");
        Map<String, Object> body = new HashMap<>();  
        body.put("message", "Logged out successfully");
        return body;
    }

    public JWT refresh(HttpServletRequest request ,HttpServletResponse response){
        String refreshToken = CookieUtils.getCookieValue(request, "refreshToken");

        String username = jwtService.extractUsername(refreshToken, true);

        if (username == null){
            throw new IllegalArgumentException("Access token and/or refresh token is invalid.");
        }

        UserDetails userDetails = userDetailsService.loadUserByUsername(username);

        if (!jwtService.isValid(refreshToken, userDetails, true)) {
            throw new IllegalArgumentException("Access token and/or refresh token is invalid.");
        }

        User user = userRepository.findUserByUsername(username).orElseThrow();

        String newAccess = jwtService.generateToken(user, 24*60*60*1000, false);
        String newRefresh = jwtService.generateToken(user, 7*24*60*60*1000, true);

        CookieUtils.create(response, "refreshToken", newRefresh, true, 86400 * 7);

        return new JWT(newAccess, user.getUsername());
    }
}
