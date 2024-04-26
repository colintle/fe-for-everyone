package com.backend.backend.Room;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@RequestMapping("/admin")
@RestController
public class AdminController {
    
    // admins are able to change problem filepath
    // admins are able to give admin role to someone

    @PostMapping("/problem")
    public ResponseEntity<Object> changeProblem(@RequestBody Room room) {
        return ResponseEntity.status(HttpStatus.OK).body(null);
    }

    @PostMapping("/change")
    public ResponseEntity<Object> changeAdmin(@RequestBody Map<String,Object> request) {
        return ResponseEntity.status(HttpStatus.OK).body(null);
    }
    
}
