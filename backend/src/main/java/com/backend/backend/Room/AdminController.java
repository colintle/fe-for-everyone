package com.backend.backend.Room;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.core.Authentication;

import java.util.Map;

import org.springframework.boot.autoconfigure.kafka.KafkaProperties.Admin;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@RequestMapping("/admin")
@RestController
public class AdminController {
    
    // admins are able to change problem filepath
    // admins are able to give admin role to someone
    private final RoomService roomService;

    public AdminController(RoomService roomService){
        this.roomService = roomService;
    }

    @PostMapping("/problem")
    public ResponseEntity<Object> changeProblem(@RequestBody Room room, Authentication authentication) {
        return ResponseEntity.status(HttpStatus.OK).body(roomService.changeProblem(room, authentication));
    }

    @PostMapping("/change")
    public ResponseEntity<Object> changeAdmin(@RequestBody Map<String,String> request, Authentication authentication) {
        return ResponseEntity.status(HttpStatus.OK).body(roomService.changeAdmin(request, authentication));
    }
    
}
