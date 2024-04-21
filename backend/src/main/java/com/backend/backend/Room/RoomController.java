package com.backend.backend.Room;

import org.springframework.web.bind.annotation.RestController;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@RestController
@RequestMapping("/room")
public class RoomController {
    private final RoomService roomService;

    public RoomController(RoomService roomService){
        this.roomService = roomService;
    }

    @PostMapping("/create")
    public String createRoom(@RequestBody Room room, Authentication authentication) {
        return "Test";
    }

    @PostMapping("/join")
    public String joinRoom(@RequestBody Room room, Authentication authentication) {
        return "Test";
    }

    @GetMapping("/leave")
    public ResponseEntity<Object> leaveRoom(Authentication authentication) {
        return ResponseEntity.status(HttpStatus.OK).body(roomService.leaveRoom(authentication)); 
    }

    @GetMapping("/hasJoined")
    public ResponseEntity<Object> hasJoined(Authentication authentication) {
        return ResponseEntity.status(HttpStatus.OK).body(roomService.getJoinedRoom(authentication)); 
    }
    
}
