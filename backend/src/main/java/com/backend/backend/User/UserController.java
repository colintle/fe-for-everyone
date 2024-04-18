package com.backend.backend.User;

import java.security.SignatureException;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.backend.backend.JWT.JWT;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;


@RestController
public class UserController {
    private final UserService userService;

     public UserController(UserService userService) {
         this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<JWT> register(
             @RequestBody User request,
             HttpServletResponse response
             ) {
         return ResponseEntity.ok(userService.register(request, response));
     }

     @PostMapping("/login")
     public ResponseEntity<JWT> login(
             @RequestBody User request,
             HttpServletResponse response
     ) {
         return ResponseEntity.ok(userService.authenticate(request, response));
     }

     @DeleteMapping("/signout")
     public ResponseEntity<Object> signout(HttpServletResponse response) {    
        return ResponseEntity.status(HttpStatus.OK).body(userService.logout(response));
     }

     @GetMapping("/refresh")
     public ResponseEntity<JWT> refresh(HttpServletRequest request, HttpServletResponse response) throws SignatureException {
         return ResponseEntity.ok(userService.refresh(request, response));
     }
     
     
}
