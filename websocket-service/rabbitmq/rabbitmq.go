package rabbitmq

import (
	"fmt"
	"log"
	"os"
	"encoding/json"

	"github.com/rabbitmq/amqp091-go"
)

func ConnectRabbitMQ() (*amqp091.Connection, error) {
	username := os.Getenv("RABBITMQ_USERNAME")
	password := os.Getenv("RABBITMQ_PASSWORD")
	
	if username == "" || password == "" {
		log.Fatalf("Environment variables RABBITMQ_USERNAME or RABBITMQ_PASSWORD are not set")
	}

	rabbitMQURL := fmt.Sprintf("amqp://%s:%s@rabbitmq:5672/", username, password)

	// Connect to RabbitMQ
	conn, err := amqp091.Dial(rabbitMQURL)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to RabbitMQ: %v", err)
	}
	return conn, nil
}

func SubscribeToQueues(conn *amqp091.Connection) {
	subscribeToQueue(conn, "create_room")
	subscribeToQueue(conn, "delete_room")
	subscribeToQueue(conn, "user_joined")
	subscribeToQueue(conn, "user_left")
	subscribeToQueue(conn, "change_admin")
	subscribeToQueue(conn, "change_problem")
}

func subscribeToQueue(conn *amqp091.Connection, queueName string) {
	channel, err := conn.Channel()
	if err != nil {
		log.Fatalf("Could not create channel: %v", err)
	}
	defer channel.Close()

	err = channel.Qos(1, 0, false)
	if err != nil {
		log.Fatalf("Could not set QoS: %v", err)
	}

	messages, err := channel.Consume(
		queueName,
		"",
		false,
		false,
		false,
		false,
		nil,
	)
	if err != nil {
		log.Fatalf("Could not register consumer: %v", err)
	}

	go func() {
		for msg := range messages {
			handleQueueSubscribers(queueName, msg)
			msg.Ack(false)
		}
	}()
}

func handleQueueSubscribers(channelName string, msg amqp091.Delivery) {
	var messageData map[string]string

	err := json.Unmarshal(msg.Body, &messageData)
	if err != nil {
		log.Printf("Error parsing JSON data from channel %s: %v", channelName, err)
		return
	}

	switch channelName {
	case "create_room":
		handleCreateRoom(messageData)
	case "delete_room":
		handleDeleteRoom(messageData)
	case "user_joined":
		handleUserJoined(messageData)
	case "user_left":
		handleUserLeft(messageData)
	case "change_admin":
		handleChangeAdmin(messageData)
	case "change_problem":
		handleChangeProblem(messageData)
	default:
		log.Printf("Unknown channel: %s", channelName)
	}
}