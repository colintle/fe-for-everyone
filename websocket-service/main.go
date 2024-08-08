package main

import (
	"context"
	"log"
	"net/http"
	"sync"

	"github.com/go-redis/redis/v8"
	"github.com/gorilla/websocket"
	"github.com/google/uuid"
)

// Context for Redis operations
var ctx = context.Background()

// Redis client instance
var rdb *redis.Client

// WebSocket upgrader with buffer sizes increased to handle large messages
var upgrader = websocket.Upgrader{
    ReadBufferSize:  65536,
    WriteBufferSize: 65536,
}

// Map to store WebSocket connections for each room
var (
    roomConnections = make(map[string][]*websocket.Conn)
)

// Generate a unique instance ID
var instanceID = uuid.New().String()

// Mutex for synchronizing access to roomConnections map
var connMutex = &sync.Mutex{}

func main() {
	// Initialize Redis connection
	initializeRedis()

	// Subscribe to Redis channels
	subscribeToRedis()

	// Set up HTTP handler for WebSocket connections
	http.HandleFunc("/ws", roomHandler)
	log.Println("WebSocket service starting on :8081...")

	// Start the HTTP server on port 8081
	if err := http.ListenAndServe(":8081", nil); err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}