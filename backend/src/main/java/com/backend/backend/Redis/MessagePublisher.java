package com.backend.backend.Redis;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.listener.ChannelTopic;
import org.springframework.stereotype.Service;
import java.util.Map;

@Service
public class MessagePublisher {
    private final RedisTemplate<String, Object> redisTemplate;
    private final ChannelTopic createRoomTopic;
    private final ChannelTopic deleteRoomTopic;
    private final ChannelTopic userJoinedTopic;
    private final ChannelTopic userLeftTopic;

    public MessagePublisher(RedisTemplate<String, Object> redisTemplate,
                            ChannelTopic createRoomTopic,
                            ChannelTopic deleteRoomTopic,
                            ChannelTopic userJoinedTopic,
                            ChannelTopic userLeftTopic) {
        this.redisTemplate = redisTemplate;
        this.createRoomTopic = createRoomTopic;
        this.deleteRoomTopic = deleteRoomTopic;
        this.userJoinedTopic = userJoinedTopic;
        this.userLeftTopic = userLeftTopic;
    }

    public void publishCreateRoom(String message) {
        redisTemplate.convertAndSend(createRoomTopic.getTopic(), message);
    }

    public void publishDeleteRoom(String message) {
        redisTemplate.convertAndSend(deleteRoomTopic.getTopic(), message);
    }

    public void publishUserJoined(String message) {
        redisTemplate.convertAndSend(userJoinedTopic.getTopic(), message);
    }

    public void publishUserLeft(String message) {
        redisTemplate.convertAndSend(userLeftTopic.getTopic(), message);
    }
}

// messagePublisher.publish("admin_notifications", message);
