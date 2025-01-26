package com.backend.backend;

import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ApplicationContext;

@SpringBootApplication
public class BackendApplication {

    public static void main(String[] args) {
        ApplicationContext context = SpringApplication.run(BackendApplication.class, args);

        try {
            ConnectionFactory connectionFactory = context.getBean(ConnectionFactory.class);
            connectionFactory.createConnection().close();
            System.out.println("Successfully connected to RabbitMQ!");
        } catch (Exception e) {
            System.err.println("Failed to connect to RabbitMQ. Application will terminate.");
            e.printStackTrace(); // Log the stack trace for debugging
            System.exit(1);
        }
    }
}
