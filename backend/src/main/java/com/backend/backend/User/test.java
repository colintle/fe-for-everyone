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
        response.put("Test", "This is create from Java API");
        messagePublisher.publishCreateRoom(response);

        return ResponseEntity.ok("Room update message sent");
    }
    
}
