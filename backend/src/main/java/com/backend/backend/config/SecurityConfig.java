package com.backend.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.backend.backend.JWT.JWTFilter;
import com.backend.backend.User.UserDetailsServiceImp;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    private final UserDetailsServiceImp userDetailsServiceImp;

     private final JWTFilter jwtFilter;

     public SecurityConfig(UserDetailsServiceImp userDetailsServiceImp, JWTFilter jwtFilter) {
         this.userDetailsServiceImp = userDetailsServiceImp;
         this.jwtFilter = jwtFilter;
     }

     @Bean
     public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
         return http
                 .csrf(AbstractHttpConfigurer::disable)
                 .authorizeHttpRequests(
                         req->req.requestMatchers("/login/**","/register/**", "/refresh/**", "/signout/**")
                                 .permitAll()
                                 .requestMatchers("/admin/**").hasAuthority("ROLE_ADMIN")
                                 .anyRequest()
                                 .authenticated()
                 ).userDetailsService(userDetailsServiceImp)
                 .sessionManagement(session->session
                         .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                 .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
                 .build();

     }

     @Bean
     public PasswordEncoder passwordEncoder() {
         return new BCryptPasswordEncoder();
     }

     @Bean
     public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
         return configuration.getAuthenticationManager();
     }
}
