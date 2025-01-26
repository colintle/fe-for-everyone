package com.backend.backend.RabbitMQ;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.amqp.core.Queue;

@Configuration
public class RabbitMQCreateQueues {
    
    @Bean
    public Queue createRoomQueue(){
        return new Queue("create_room", true);
    }

    @Bean
    public Queue deleteRoomQueue(){
        return new Queue("delete_room", true);
    }

    @Bean
    public Queue userJoinedQueue(){
        return new Queue("user_joined", true);
    }

    @Bean
    public Queue userLeftQueue(){
        return new Queue("user_left", true);
    }   

    @Bean
    public Queue changeAdminQueue(){
        return new Queue("change_admin", true);
    }

    @Bean
    public Queue changeProblemQueue(){
        return new Queue("change_problem", true);
    }
}
