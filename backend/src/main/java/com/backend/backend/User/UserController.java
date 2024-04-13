package com.backend.backend.User;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.backend.backend.JWT.JWT;

@RestController
public class UserController {
    private final UserService userService;

     public UserController(UserService userService) {
         this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<JWT> register(
             @RequestBody User request
             ) {
         return ResponseEntity.ok(userService.register(request));
     }

     @PostMapping("/login")
     public ResponseEntity<JWT> login(
             @RequestBody User request
     ) {
         return ResponseEntity.ok(userService.authenticate(request));
     }
}
