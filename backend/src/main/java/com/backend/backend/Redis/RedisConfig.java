package com.backend.backend.Redis;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.listener.ChannelTopic;
import org.springframework.data.redis.serializer.GenericToStringSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;

@Configuration
public class RedisConfig {

    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory connectionFactory) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);
        
        template.setKeySerializer(new StringRedisSerializer());
        template.setValueSerializer(new GenericToStringSerializer<>(Object.class));
        template.setHashKeySerializer(new StringRedisSerializer());
        template.setHashValueSerializer(new GenericToStringSerializer<>(Object.class));
        
        return template;
    }

    @Bean
    public ChannelTopic createRoomTopic() {
        return new ChannelTopic("create_room");
    }

    @Bean
    public ChannelTopic deleteRoomTopic() {
        return new ChannelTopic("delete_room");
    }

    @Bean
    public ChannelTopic userJoinedTopic() {
        return new ChannelTopic("user_joined");
    }

    @Bean
    public ChannelTopic userLeftTopic() {
        return new ChannelTopic("user_left");
    }
}
