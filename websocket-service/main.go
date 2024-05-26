package main

import (
	"context"
	"log"
	"net/http"
	"sync"

	"github.com/go-redis/redis/v8"
	"github.com/gorilla/websocket"
)

var ctx = context.Background()
var rdb *redis.Client
var upgrader = websocket.Upgrader{
    ReadBufferSize:  1024,
    WriteBufferSize: 1024,
}
var (
    roomConnections = make(map[string][]*websocket.Conn)
)
var connMutex = &sync.Mutex{}

func main() {
	initializeRedis()

	subscribeToRedis()

	http.HandleFunc("/ws/", roomHandler)
	log.Println("WebSocket service starting on :8081...")
	if err := http.ListenAndServe(":8081", nil); err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}