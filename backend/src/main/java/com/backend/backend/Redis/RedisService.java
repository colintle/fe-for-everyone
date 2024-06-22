package com.backend.backend.Redis;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.Map;
import java.util.concurrent.TimeUnit;

@Service
public class RedisService {

    private final RedisTemplate<String, Object> redisTemplate;
    private final ObjectMapper objectMapper;

    public RedisService(RedisTemplate<String, Object> redisTemplate) {
        this.redisTemplate = redisTemplate;
        this.objectMapper = new ObjectMapper();
    }

    public boolean waitForRoomInRedis(String roomID) {
        String key = "room:" + roomID;
        return waitForKeyInRedis(key);
    }

    public boolean waitForUserInRedis(String userID) {
        String key = "user:" + userID;
        return waitForKeyInRedis(key);
    }

    public boolean waitForRoomDeletion(String roomID) {
        String key = "room:" + roomID;
        return waitForKeyDeletion(key);
    }

    public boolean waitForUserDeletion(String userID) {
        String key = "user:" + userID;
        return waitForKeyDeletion(key);
    }

    public boolean verifyProblemStatementInRoom(String roomID, String expectedProblemStatement) {
        String key = "room:" + roomID;
        try {
            String roomData = (String) redisTemplate.opsForValue().get(key);
            if (roomData != null) {
                Map<String, Object> roomMap = objectMapper.readValue(roomData, Map.class);
                return expectedProblemStatement.equals(roomMap.get("problemStatement"));
            }
        } catch (Exception e) {
            System.out.println("Error verifying problem statement in Redis: " + e.getMessage());
        }
        return false;
    }

    public boolean verifyAdmin(String roomID, String userID) {
        String key = "room:" + roomID;
        try {
            String roomData = (String) redisTemplate.opsForValue().get(key);
            if (roomData != null) {
                Map<String, Object> roomMap = objectMapper.readValue(roomData, Map.class);
                Map<String, String> adminMap = (Map<String, String>) roomMap.get("admin");
                return userID.equals(adminMap.get("userID"));
            }
        } catch (Exception e) {
            System.out.println("Error verifying admin in Redis: " + e.getMessage());
        }
        return false;
    }

    private boolean waitForKeyInRedis(String key) {
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

    private boolean waitForKeyDeletion(String key) {
        for (int i = 0; i < 30; i++) {
            Boolean exists = redisTemplate.hasKey(key);
            if (Boolean.FALSE.equals(exists)) {
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
