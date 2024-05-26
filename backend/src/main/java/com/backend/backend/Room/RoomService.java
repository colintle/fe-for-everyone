package com.backend.backend.Room;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Random;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import com.backend.backend.Redis.MessagePublisher;
import com.backend.backend.User.User;
import com.backend.backend.User.User.Role;

import com.backend.backend.User.UserRepository;

@Service
public class RoomService {
    
    private final UserRepository userRepository;
    private final RoomRepository roomRepository;
    private final MessagePublisher messagePublisher;
    private final RedisTemplate<String, Object> redisTemplate;


    public RoomService(UserRepository userRepository, RoomRepository roomRepository, MessagePublisher messagePublisher, RedisTemplate<String, Object> redisTemplate){
        this.userRepository = userRepository;
        this.roomRepository = roomRepository;
        this.messagePublisher = messagePublisher;
        this.redisTemplate = redisTemplate;
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
        Map<String, Object> response = new HashMap<>();
        User user = getUserWithRoom(userDetails.getId());

        response.put("room", user.getRoom() == null ? null : user.getRoom().getRoomID());
        response.put("role", user.getRole());
        response.put("adminID", user.getRoom() == null ? null : user.getRoom().getAdmin().getId());
        response.put("admin", user.getRoom() == null ? null : user.getRoom().getAdmin().getUsername());
        response.put("problemStatementPath", user.getRoom() == null ? null : user.getRoom().getProblemStatementPath());

        return response;
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

    private User assignNewAdmin(Room room) {
        List<User> potentialAdmins = userRepository.findByRoom(room);
        if (!potentialAdmins.isEmpty()) {
            Random rand = new Random();
            User newAdmin = potentialAdmins.get(rand.nextInt(potentialAdmins.size()));
            newAdmin.setRole(User.Role.ADMIN);
            room.setAdmin(newAdmin);

            roomRepository.save(room);
            userRepository.save(newAdmin);

            return newAdmin;
        }

        return null;
    }

    public Map<String, Object> leaveRoom(Authentication authentication){
        Map<String, Object> redisResponse = new HashMap<>();
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

        redisResponse.put("userID", userDetails.getId());
        redisResponse.put("user", userDetails.getUsername());
        redisResponse.put("room", currentRoom.getRoomID());

        if (currentRoom.getUserCount() == 0){
            deleteRoom(currentRoom.getRoomID());
            messagePublisher.publishDeleteRoom(redisResponse);
        }
        else if (isAdmin){
            User newAdmin = assignNewAdmin(currentRoom);
            if (newAdmin != null){
                Map<String, Object> adminResponse = new HashMap<>();
                adminResponse.put("message", "Successfully changed admin");
                adminResponse.put("admin", newAdmin.getUsername());
                adminResponse.put("adminID", newAdmin.getId());
                adminResponse.put("room", currentRoom.getRoomID());

                messagePublisher.publishChangeAdmin(adminResponse);
            }
        }

        messagePublisher.publishUserLeft(redisResponse);
        response.put("message", "You have successfully left your room.");

        return response;
    }

    public Map<String, Object> createRoom(Room requestBody, Authentication authentication){
        if (requestBody.getRoomName().isEmpty() || requestBody.getProblemStatementPath().isEmpty()) {
            throw new IllegalArgumentException("One of the required fields is empty.");
        }

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
        response.put("roomName", newRoom.getRoomName());
        response.put("problemStatementPath", newRoom.getProblemStatementPath());
        response.put("admin", newRoom.getAdmin().getUsername());
        response.put("adminID", newRoom.getAdmin().getId());
        response.put("message", "Room created successfully with admin privileges.");

        messagePublisher.publishCreateRoom(response);

        if (!waitForRoomInRedis(newRoom.getRoomID().toString())) {
            throw new RuntimeException("Timeout waiting for room to be set in Redis");
        }

        return response;
    }
    
    public Map<String, Object> joinRoom(Room requestBody, Authentication authentication){
        if (requestBody.getRoomID() == null) {
            throw new IllegalArgumentException("One of the required fields is empty.");
        }

        UUID roomID = requestBody.getRoomID();

        if (roomRepository.existsById(roomID)){
            User user = getUserDetails(authentication);
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
            response.put("admin", room.getAdmin().getUsername());
            response.put("adminID", room.getAdmin().getId());
            response.put("message", "Room successfully joined.");

            Map<String, Object> redisResponse = new HashMap<>();
            redisResponse.put("userID", user.getId());
            redisResponse.put("user", user.getUsername());
            redisResponse.put("room", room.getRoomID());

            messagePublisher.publishUserJoined(redisResponse);
            return response;
        }
        else{
            throw new IllegalArgumentException("Room does not exist.");
        }
    }

    public Map<String, Object> changeProblem(Room requestBody, Authentication authentication){
        if (requestBody.getProblemStatementPath().isEmpty()) {
            throw new IllegalArgumentException("One of the required fields is empty.");
        }

        User userDetails = getUserDetails(authentication);
        User userWithRoom = getUserWithRoom(userDetails.getId());
        Room currentRoom = userWithRoom.getRoom();

        currentRoom.setProblemStatementPath(requestBody.getProblemStatementPath());
        roomRepository.save(currentRoom);

        Map<String, Object> response = new HashMap<>();
        response.put("problemStatementPath", requestBody.getProblemStatementPath());
        response.put("message", "Successfully changed the problem.");
        response.put("room", currentRoom.getRoomID());

        messagePublisher.publishChangeProblem(response);

        return response;
    }

    public Map<String, Object> changeAdmin(Map<String,String> requestBody, Authentication authentication){
        if (requestBody.get("userID") == null) {
            throw new IllegalArgumentException("One of the required fields is empty.");
        }

        User userDetails = getUserDetails(authentication);
        User userWithRoom = getUserWithRoom(userDetails.getId());
        Room currentRoom = userWithRoom.getRoom();

        Optional<User> potentialUser = userRepository.findById(Long.parseLong(requestBody.get("userID")));

        if (!potentialUser.isPresent()){
            throw new IllegalArgumentException("User in question does not exist.");
        }

        User secondUser = potentialUser.get();

        currentRoom.setAdmin(secondUser);
        roomRepository.save(currentRoom);

        userWithRoom.setRole(Role.USER);
        userRepository.save(userWithRoom);

        secondUser.setRoom(currentRoom);
        secondUser.setRole(Role.ADMIN);
        userRepository.save(secondUser);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Successfully changed admin");
        response.put("admin", currentRoom.getAdmin().getUsername());
        response.put("adminID", currentRoom.getAdmin().getId());
        response.put("room", currentRoom.getRoomID());
        response.put("problemStatementPath", currentRoom.getProblemStatementPath());

        messagePublisher.publishChangeAdmin(response);

        return response;
    }

    private boolean waitForRoomInRedis(String roomID) {
        String key = "room:" + roomID;
        for (int i = 0; i < 30; i++) {
            Boolean exists = redisTemplate.hasKey(key);
            if (Boolean.TRUE.equals(exists)) {
                return true;
            }
            try {
                TimeUnit.SECONDS.sleep(1);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                return false;
            }
        }
        return false;
    }
}
