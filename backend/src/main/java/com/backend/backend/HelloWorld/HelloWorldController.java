package com.backend.backend.HelloWorld;

import java.util.List;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.backend.backend.User.User;
import com.backend.backend.User.UserRepository;

@RestController
class HelloWorldController {

    private final UserRepository userRepository;

    public HelloWorldController(UserRepository userRepository){
        this.userRepository = userRepository;
    }

    @GetMapping("/hello")
    public UserDetails sayHello(Authentication authentication) {
        UsernamePasswordAuthenticationToken authToken = (UsernamePasswordAuthenticationToken) authentication;
        UserDetails userDetails = (UserDetails) authToken.getPrincipal();

        return userDetails;
    }
}
