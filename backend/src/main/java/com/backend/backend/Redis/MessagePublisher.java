package com.backend.backend.Redis;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.listener.ChannelTopic;
import org.springframework.stereotype.Service;
import java.util.Map;

@Service
public class MessagePublisher {
    private RedisTemplate<String, Object> redisTemplate;
    private Map<String, ChannelTopic> topics;

    public MessagePublisher(RedisTemplate<String, Object> redisTemplate, Map<String, ChannelTopic> topics) {
        this.redisTemplate = redisTemplate;
        this.topics = topics;
    }

    public void publish(final String topicName, final String message) {
        ChannelTopic topic = topics.get(topicName);
        if (topic != null) {
            redisTemplate.convertAndSend(topic.getTopic(), message);
        } else {
            throw new IllegalArgumentException("Invalid topic name");
        }
    }
}

// messagePublisher.publish("admin_notifications", message);
