package main

import (
	"fmt"
	"log"
	"os"

	"github.com/rabbitmq/amqp091-go"
)

// Connect to RabbitMQ
func connectRabbitMQ() (*amqp091.Connection, error) {
	// Fetch username and password from environment variables
	username := os.Getenv("RABBITMQ_USERNAME")
	password := os.Getenv("RABBITMQ_PASSWORD")
	
	if username == "" || password == "" {
		log.Fatalf("Environment variables RABBITMQ_USERNAME or RABBITMQ_PASSWORD are not set")
	}

	// Use fmt.Sprintf to format the connection string with environment variables
	rabbitMQURL := fmt.Sprintf("amqp://%s:%s@rabbitmq:5672/", username, password)

	// Connect to RabbitMQ
	conn, err := amqp091.Dial(rabbitMQURL)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to RabbitMQ: %v", err)
	}
	return conn, nil
}