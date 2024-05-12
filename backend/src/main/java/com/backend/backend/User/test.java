package com.backend.backend.User;

import org.springframework.web.bind.annotation.RestController;

import com.backend.backend.Redis.MessagePublisher;

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
        messagePublisher.publishCreateRoom("This is createRoom from Java API");
        return ResponseEntity.ok("Room update message sent");
    }
    
}
