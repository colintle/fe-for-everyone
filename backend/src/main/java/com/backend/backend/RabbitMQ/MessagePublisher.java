package com.backend.backend.RabbitMQ;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

@Service
public class MessagePublisher {
    private final RabbitTemplate rabbitTemplate;

    public MessagePublisher(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    public void publishCreateRoom(Object message) {
        rabbitTemplate.convertAndSend("create_room", message);
    }

    public void publishDeleteRoom(Object message) {
        rabbitTemplate.convertAndSend("delete_room", message);
    }

    public void publishUserJoined(Object message) {
        rabbitTemplate.convertAndSend("user_joined", message);
    }

    public void publishUserLeft(Object message) {
        rabbitTemplate.convertAndSend("user_left", message);
    }

    public void publishChangeAdmin(Object message) {
        rabbitTemplate.convertAndSend("change_admin", message);
    }

    public void publishChangeProblem(Object message) {
        rabbitTemplate.convertAndSend("change_problem", message);
    }
}
