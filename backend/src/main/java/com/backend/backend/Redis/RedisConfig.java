package com.backend.backend.Redis;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.listener.ChannelTopic;

import java.util.Map;
import java.util.HashMap;

@Configuration
public class RedisConfig {
    @Bean
    public ChannelTopic createRoomTopic() {
        return new ChannelTopic("createRoom");
    }

    @Bean
    public ChannelTopic deleteRoomTopic() {
        return new ChannelTopic("deleteRoom");
    }

    @Bean
    public ChannelTopic userJoinedTopic() {
        return new ChannelTopic("userJoined");
    }

    @Bean
    public ChannelTopic userLeftTopic() {
        return new ChannelTopic("userLeft");
    }

    // Map to store all topics
    @Bean
    public Map<String, ChannelTopic> topicsMap() {
        Map<String, ChannelTopic> topics = new HashMap<>();
        topics.put("createRoom", createRoomTopic());
        topics.put("deleteRoom", deleteRoomTopic());
        topics.put("userJoined", userJoinedTopic());
        topics.put("userLeft", userLeftTopic());
        return topics;
    }
}
