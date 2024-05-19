package com.backend.backend.User;

import org.springframework.web.bind.annotation.RestController;

import com.backend.backend.Redis.MessagePublisher;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;


@RestController
public class test {
    private final MessagePublisher messagePublisher;

    public test(MessagePublisher messagePublisher){
        this.messagePublisher = messagePublisher;
    }
    
    @GetMapping("/test")
    public ResponseEntity<String> testRedis() {
        Map<String,String> response = new HashMap<>();

        response.put("room", "dummyRoomID");
        response.put("roomName", "Dummy Conference Room");
        response.put("problemStatementPath", "/dummy/path/to/problem"); 
        response.put("admin", "dummyAdminUsername"); 
        response.put("adminID", "dummyAdminID"); 
        response.put("message", "Room created successfully with admin privileges."); 

        messagePublisher.publishCreateRoom(response);

        return ResponseEntity.ok("Room update message sent");
    }
    
}
