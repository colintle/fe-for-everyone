package com.backend.backend.Room;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Random;
import java.util.UUID;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import com.backend.backend.User.User;
import com.backend.backend.User.User.Role;
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

    public User getUserWithRoom(long userId) {
        Optional<User> user = userRepository.findByIdWithRoom(userId);
        return user.orElse(null);
    }

    public Map<String, Object> getJoinedRoom(Authentication authentication){
        User userDetails = getUserDetails(authentication);
        Map<String, Object> attributes = new HashMap<>();
        User user = getUserWithRoom(userDetails.getId());

        attributes.put("room", user.getRoom() == null ? null : user.getRoom().getRoomID());
        attributes.put("role", user.getRole());
        attributes.put("adminID", user.getRoom() == null ? null : user.getRoom().getAdmin().getId());
        attributes.put("admin", user.getRoom() == null ? null : user.getRoom().getAdmin().getName());
        return attributes;
    }


    public boolean ifJoinedRoom(Authentication authentication){
        Map<String, Object> joinedRoomDetails = getJoinedRoom(authentication);

        if (joinedRoomDetails != null && joinedRoomDetails.containsKey("room")) {
            UUID room = (UUID) joinedRoomDetails.get("room");
            return room != null;
        }

        return false;
    }

    public void deleteRoom(UUID roomID){
        userRepository.nullifyRoomInUsers(roomID);
        roomRepository.deleteById(roomID);
    }

    private void assignNewAdmin(Room room) {
        List<User> potentialAdmins = userRepository.findByRoom(room);
        if (!potentialAdmins.isEmpty()) {
            Random rand = new Random();
            User newAdmin = potentialAdmins.get(rand.nextInt(potentialAdmins.size()));
            newAdmin.setRole(User.Role.ADMIN);
            room.setAdmin(newAdmin);

            roomRepository.save(room);
            userRepository.save(newAdmin);
        }
    }

    public Map<String, Object> leaveRoom(Authentication authentication){
        Map<String, Object> response = new HashMap<>();

        if (!ifJoinedRoom(authentication)){
            response.put("message", "User is not in a room.");
            return response;
        }

        User userDetails = getUserDetails(authentication);
        User userWithRoom = getUserWithRoom(userDetails.getId());
        Room currentRoom = userWithRoom.getRoom();

        boolean isAdmin = userDetails.getRole() == User.Role.ADMIN;

        userDetails.setRole(null);
        userDetails.setRoom(null);
        userRepository.save(userDetails);

        currentRoom.decrementUserCount();
        roomRepository.save(currentRoom);

        if (currentRoom.getUserCount() == 0){
            deleteRoom(currentRoom.getRoomID());
        }
        else if (isAdmin){
            assignNewAdmin(currentRoom);
        }

        response.put("message", "You have successfully left your room.");

        return response;
    }

    public Map<String, Object> createRoom(Room requestBody, Authentication authentication){
        Room newRoom = new Room();
        User user = getUserDetails(authentication);
    
        newRoom.setRoomName(requestBody.getRoomName());
        newRoom.setProblemStatementPath(requestBody.getProblemStatementPath());
        newRoom.incrementUserCount();
        newRoom.setAdmin(user);

        roomRepository.save(newRoom);
    
        user.setRole(Role.ADMIN);
        user.setRoom(newRoom);
            
        userRepository.save(user);
    
        Map<String, Object> response = new HashMap<>();
        response.put("room", newRoom.getRoomID());
        response.put("problemStatementPath", newRoom.getProblemStatementPath());
        response.put("admin", newRoom.getAdmin().getName());
        response.put("adminID", newRoom.getAdmin().getId());
        response.put("message", "Room created successfully with admin privileges.");
        return response;
    }
    
    public Map<String, Object> joinRoom(Room requestBody, Authentication authentication){
        System.out.println(requestBody);
        UUID roomID = requestBody.getRoomID();

        if (roomRepository.existsById(roomID)){
            User user = getUserDetails(authentication);
            // Room room = roomRepository.getReferenceById(roomID);
            Optional<Room> ifRoom = roomRepository.findById(roomID);

            Room room = ifRoom.get();
            user.setRole(Role.USER);
            user.setRoom(room);

            room.incrementUserCount();
            roomRepository.save(room);
            userRepository.save(user);

            Map<String, Object> response = new HashMap<>();
            response.put("room", room.getRoomID());
            response.put("problemStatementPath", room.getProblemStatementPath());
            response.put("admin", room.getAdmin().getName());
            response.put("adminID", room.getAdmin().getId());
            response.put("message", "Room successfully joined.");
            return response;
        }
        else{
            throw new IllegalArgumentException("Room does not exist.");
        }
    }
}
