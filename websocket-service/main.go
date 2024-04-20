package main

import (
	"context"
	"fmt"
	"log"
	"net/http"

	"github.com/go-redis/redis/v8"
	"github.com/gorilla/websocket"
)

var ctx = context.Background()

var rdb *redis.Client
var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // Adjust to serve your needs
	},
}

func main() {
	// Initialize Redis client.
	initializeRedis()

	// Start WebSocket server.
	http.HandleFunc("/ws", handleConnections)
	log.Println("WebSocket server starting on port 8080...")
	log.Fatal(http.ListenAndServe(":8080", nil))
}

func initializeRedis() {
	rdb = redis.NewClient(&redis.Options{
		Addr:     "redis:6379",
		Password: "", // No password set by default
		DB:       0,  // Use default DB
	})

	_, err := rdb.Ping(ctx).Result()
	if err != nil {
		log.Fatalf("Could not connect to Redis: %v", err)
	}
	fmt.Println("Connected to Redis")
}

func handleConnections(w http.ResponseWriter, r *http.Request) {
	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Fatal(err)
	}
	defer ws.Close()

	// Run the reader in a separate goroutine so it doesn't block.
	go readFromWebSocket(ws)
}

func readFromWebSocket(ws *websocket.Conn) {
	for {
		_, message, err := ws.ReadMessage()
		if err != nil {
			log.Printf("Error reading from WebSocket: %v", err)
			break
		}

		// Publish the message to the Redis "chat" channel
		err = rdb.Publish(ctx, "chat", string(message)).Err()
		if err != nil {
			log.Printf("Error publishing to Redis: %v", err)
			continue
		}

		log.Printf("Published to Redis: %s", message)
	}
}
