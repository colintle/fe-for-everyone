package com.backend.backend.User;

import java.util.Optional;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.backend.backend.JWT.JWT;
import com.backend.backend.JWT.JWTService;

@Service
public class UserService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JWTService jwtService;
    private final AuthenticationManager authenticationManager;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, JWTService jwtService, AuthenticationManager authenticationManager){
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
    }

    public JWT authenticate(User request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()
                )
        );

        User user = userRepository.findUserByEmail(request.getUsername()).orElseThrow();
        String token = jwtService.generateToken(user);

        return new JWT(token);
    }

    public JWT register(User request) {
        if (request.getName().isEmpty() || request.getUsername().isEmpty() || request.getPassword().isEmpty()) {
            throw new IllegalArgumentException("Name, username, and password must not be empty.");
        }

        Optional<User> existingUser = userRepository.findUserByEmail(request.getUsername());
        if (existingUser.isPresent()) {
            throw new BadCredentialsException("A user with the given username already exists.");
        }

        User user = new User();
        user.setName(request.getName());
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        try {
            user = userRepository.save(user);
        } catch (DataIntegrityViolationException e) {
            throw new IllegalStateException("User cannot be registered. Possible duplicate username.", e);
        }

        String token = jwtService.generateToken(user);
        return new JWT(token);
    }
}
