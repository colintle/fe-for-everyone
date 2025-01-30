package com.backend.backend.Room;

import org.springframework.web.bind.annotation.RestController;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;

@RestController
@RequestMapping("/room")
public class RoomController {
    private final RoomService roomService;

    public RoomController(RoomService roomService){
        this.roomService = roomService;
    }

    // tested
    @PostMapping("/create")
    public ResponseEntity<Object> createRoom(@RequestBody Room room, Authentication authentication) {
        if (roomService.ifJoinedRoom(authentication)){
            Map<String, Object> body = new HashMap<>();
            body.put("message", "User has already joined a room.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
        }
        else{
            return ResponseEntity.status(HttpStatus.OK).body(roomService.createRoom(room, authentication));
        }
    }

    @PostMapping("/join")
    public ResponseEntity<Object> joinRoom(@RequestBody Room room, Authentication authentication) {
        if (roomService.ifJoinedRoom(authentication)){
            Map<String, Object> body = new HashMap<>();
            body.put("message", "User has already joined a room.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
        }
        else{
            return ResponseEntity.status(HttpStatus.OK).body(roomService.joinRoom(room, authentication));
        }
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
