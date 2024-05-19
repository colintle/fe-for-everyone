package com.backend.backend.Redis;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.listener.ChannelTopic;
import org.springframework.data.redis.serializer.Jackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;

@Configuration
public class RedisConfig {

    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory connectionFactory) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);

        // Serializer for string type keys
        template.setKeySerializer(new StringRedisSerializer());

        // Serializer for object type values
        Jackson2JsonRedisSerializer<Object> serializer = new Jackson2JsonRedisSerializer<>(Object.class);
        template.setValueSerializer(serializer);

        template.setHashKeySerializer(new StringRedisSerializer());
        template.setHashValueSerializer(serializer);

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

    @Bean ChannelTopic changeAdminTopic() {
        return new ChannelTopic("change_admin");
    }

    @Bean ChannelTopic changeProblemTopic() {
        return new ChannelTopic("change_problem");
    }
}
