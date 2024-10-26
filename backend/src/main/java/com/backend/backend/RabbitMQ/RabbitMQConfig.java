package com.backend.backend.RabbitMQ;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.amqp.core.Queue;

@Configuration
public class RabbitMQConfig {
    
    @Bean
    public Queue createRoomQueue(){
        return new Queue("create_room");
    }

    @Bean
    public Queue deleteRoomQueue(){
        return new Queue("delete_room");
    }

    @Bean
    public Queue userJoinedQueue(){
        return new Queue("user_joined");
    }

    @Bean
    public Queue userLeftQueue(){
        return new Queue("user_left");
    }   

    @Bean
    public Queue changeAdminQueue(){
        return new Queue("change_admin");
    }

    @Bean
    public Queue changeProblemQueue(){
        return new Queue("change_problem");
    }
}
