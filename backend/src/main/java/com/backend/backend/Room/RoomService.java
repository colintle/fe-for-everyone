package com.backend.backend.Room;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import com.backend.backend.User.User;
import com.backend.backend.User.UserRepository;

@Service
public class RoomService {
    
    private final UserRepository userRepository;
    private final RoomRepository roomRepository;

    public RoomService(UserRepository userRepository, RoomRepository roomRepository){
        this.userRepository = userRepository;
        this.roomRepository = roomRepository;
    }

    public User getUserDetails(Authentication authentication){
        UsernamePasswordAuthenticationToken authToken = (UsernamePasswordAuthenticationToken) authentication;
        User userDetails = (User) authToken.getPrincipal();
        return userDetails;
    }

    public Map<String, Object> getJoinedRoom(Authentication authentication){
        User userDetails = getUserDetails(authentication);
        
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("room", userDetails.getRoom());
        attributes.put("authorities", userDetails.getAuthorities());

        return attributes;
    }

    public boolean ifJoinedRoom(Authentication authentication){
        Map<String, Object> joinedRoomDetails = getJoinedRoom(authentication);

        if (joinedRoomDetails != null && joinedRoomDetails.containsKey("room")) {
            String room = (String) joinedRoomDetails.get("room");
            return room != null && !room.isEmpty();
        }

        return false;
    }

    public void deleteRoom(UUID roomID){
        userRepository.nullifyRoomInUsers(roomID);
        roomRepository.deleteById(roomID);
    }

    public Map<String, Object> leaveRoom(Authentication authentication){
        Map<String, Object> response = new HashMap<>();

        if (!ifJoinedRoom(authentication)){
            response.put("message", "User is not in a room.");
        }
        User userDetails = getUserDetails(authentication);
        Room currentRoom = roomRepository.findById(userDetails.getRoom().getRoomId()).orElseThrow();
        userDetails.setRole(null);
        userDetails.setRoom(null);

        currentRoom.decrementUserCount();
        roomRepository.save(currentRoom);

        if (currentRoom.getUserCount() == 0){
            deleteRoom(currentRoom.getRoomId());
        }

        userRepository.save(userDetails);

        response.put("message", "Successful.");

        return response;
    }
}
