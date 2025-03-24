package main

import (
	"log"
	"net/http"

	"websocket-service/rabbitmq"
	"websocket-service/redis"
)

func main() {
	rdb := redis.InitializeRedis()
	defer rdb.Close()

	redis.SubscribeToRedis()

	conn, err := rabbitmq.ConnectRabbitMQ()
	if err != nil {
		log.Fatalf("Could not connect to RabbitMQ: %v", err)
	}
	defer conn.Close()

	go rabbitmq.SubscribeToQueues(conn)

	http.HandleFunc("/ws/", redis.RoomHandler)
	log.Println("WebSocket service starting on :8081...")

	if err := http.ListenAndServe(":8081", nil); err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}