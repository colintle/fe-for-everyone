package com.backend.backend.User;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;


@RestController
public class UserController {
    
    @GetMapping("/user")
    public UserDetails sayHello(Authentication authentication) {
        UsernamePasswordAuthenticationToken authToken = (UsernamePasswordAuthenticationToken) authentication;
        UserDetails userDetails = (UserDetails) authToken.getPrincipal();

        return userDetails;
    } 
}
