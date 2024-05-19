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
    private final ChannelTopic changeAdminTopic;
    private final ChannelTopic changeProblemTopic;

    public MessagePublisher(RedisTemplate<String, Object> redisTemplate,
                            ChannelTopic createRoomTopic,
                            ChannelTopic deleteRoomTopic,
                            ChannelTopic userJoinedTopic,
                            ChannelTopic userLeftTopic,
                            ChannelTopic changeAdminTopic,
                            ChannelTopic changeProblemTopic) {
        this.redisTemplate = redisTemplate;
        this.createRoomTopic = createRoomTopic;
        this.deleteRoomTopic = deleteRoomTopic;
        this.userJoinedTopic = userJoinedTopic;
        this.userLeftTopic = userLeftTopic;
        this.changeAdminTopic = changeAdminTopic;
        this.changeProblemTopic = changeProblemTopic;
    }

    public void publishCreateRoom(Object message) {
        redisTemplate.convertAndSend(createRoomTopic.getTopic(), message);
    }

    public void publishDeleteRoom(Object message) {
        redisTemplate.convertAndSend(deleteRoomTopic.getTopic(), message);
    }

    public void publishUserJoined(Object message) {
        redisTemplate.convertAndSend(userJoinedTopic.getTopic(), message);
    }

    public void publishUserLeft(Object message) {
        redisTemplate.convertAndSend(userLeftTopic.getTopic(), message);
    }

    public void publishChangeAdmin(Object message) {
        redisTemplate.convertAndSend(changeAdminTopic.getTopic(), message);
    }

    public void publishChangeProblem(Object message) {
        redisTemplate.convertAndSend(changeProblemTopic.getTopic(), message);
    }
}

