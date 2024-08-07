package com.backend.backend.JWT;

import java.security.SignatureException;
import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.backend.backend.User.User;
import com.backend.backend.User.UserService;
import com.backend.backend.config.RateLimitService;

import io.github.bucket4j.Bucket;
import io.github.bucket4j.ConsumptionProbe;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;


@RestController
public class JWTController {
    private final UserService userService;
    private final RateLimitService rateLimitService;
    private Bucket bucket;

     public JWTController(UserService userService, RateLimitService rateLimitService) {
        this.userService = userService;
        this.rateLimitService = rateLimitService;
        this.bucket = rateLimitService.createBucket();
    }

    @DeleteMapping("/signout")
     public ResponseEntity<Object> signout(HttpServletResponse response) {    
        return ResponseEntity.status(HttpStatus.OK).body(userService.logout(response));
     }

    @PostMapping("/register")
    public ResponseEntity<Object> register(@RequestBody User request, HttpServletResponse response) {
        ConsumptionProbe probe = this.bucket.tryConsumeAndReturnRemaining(1);
        if (!probe.isConsumed()) {
            Map<String, Object> body = new HashMap<>();
            body.put("message", "Rate limit exceeded. Try again later.");
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(body);
        }
        return ResponseEntity.ok(userService.register(request, response));
    }

    @PostMapping("/login")
    public ResponseEntity<Object> login(@RequestBody User request, HttpServletResponse response) {
        ConsumptionProbe probe = this.bucket.tryConsumeAndReturnRemaining(1);
        if (!probe.isConsumed()) {
            Map<String, Object> body = new HashMap<>();
            body.put("message", "Rate limit exceeded. Try again later.");
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(body);
        }
        return ResponseEntity.ok(userService.authenticate(request, response));
    }

    @GetMapping("/refresh")
    public ResponseEntity<Object> refresh(HttpServletRequest request, HttpServletResponse response) {
        ConsumptionProbe probe = this.bucket.tryConsumeAndReturnRemaining(1);
        if (!probe.isConsumed()) {
            Map<String, Object> body = new HashMap<>();
            body.put("message", "Rate limit exceeded. Try again later.");
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(body);
        }
        return ResponseEntity.ok(userService.refresh(request, response));
    }
     
     
}
