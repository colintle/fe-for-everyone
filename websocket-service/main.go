package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"encoding/json"

	"github.com/go-redis/redis/v8"
	"github.com/gorilla/websocket"
)

type User struct {
	UserID   string `json:"userID"`
	Username string `json:"username"`
}

type Room struct {
	Admin User `json:"admin"`
	RoomID string `json:"roomID"`
	ProblemStatement string  `json:"problemStatement"`
	RoomName string `json:"roomName"`
	Users []User `json:"users"`
	Code string `json:"code"`
}


var ctx = context.Background()

var rdb *redis.Client
var upgrader = websocket.Upgrader{
    ReadBufferSize:  1024,
    WriteBufferSize: 1024,
}

func main() {
	initializeRedis()

	subscribeToRedis()

	http.HandleFunc("/ws/", roomHandler)
    log.Println("WebSocket service starting on :8081...")
    err := http.ListenAndServe(":8081", nil)
    if err != nil {
        log.Fatal("ListenAndServe: ", err)
    }
}

func initializeRedis() {
	rdb = redis.NewClient(&redis.Options{
		Addr:     "redis:6379",
		Password: "",
		DB:       0,           
	})

	_, err := rdb.Ping(ctx).Result()
	if err != nil {
		log.Fatalf("Could not connect to Redis: %v", err)
	}
	fmt.Println("Connected to Redis")
}

func subscribeToRedis() {
	subscribeToChannel("create_room")
	subscribeToChannel("delete_room")
	subscribeToChannel("user_joined")
	subscribeToChannel("user_left")
	subscribeToChannel("change_admin")
	subscribeToChannel("change_problem")
}

func subscribeToChannel(channelName string) {
	pubsub := rdb.Subscribe(ctx, channelName)
	ch := pubsub.Channel()

	go func() {
		for msg := range ch {
			handleMessage(channelName, msg)
		}
	}()
}

func handleMessage(channelName string, msg *redis.Message) {
	var messageData map[string]string

	err := json.Unmarshal([]byte(msg.Payload), &messageData)
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
		log.Printf("Unhandled channel: %s", channelName)
	}
}

func roomHandler(w http.ResponseWriter, r *http.Request) {
    roomID := r.URL.Path[len("/ws/"):] // Extract room ID from URL
    
    // Check if room exists in Redis
    exists, err := rdb.Exists(ctx, "room:"+roomID).Result()
    if err != nil {
        http.Error(w, "Internal server error", http.StatusInternalServerError)
        return
    }
    if exists == 0 {
        http.Error(w, "Room not found", http.StatusNotFound)
        return
    }

    conn, err := upgrader.Upgrade(w, r, nil)
    if err != nil {
        fmt.Println("Error upgrading to WebSocket:", err)
        return
    }
    defer conn.Close()

    fmt.Printf("Joined room: %s\n", roomID)

    for {
        _, message, err := conn.ReadMessage()
        if err != nil {
            fmt.Println("Error reading message:", err)
            break
        }
        fmt.Printf("Received message in room %s: %s\n", roomID, string(message))
        // Further message handling logic here
    }
}


func handleCreateRoom(data map[string]string) {
	admin := User{
		UserID:   data["adminID"],
		Username: data["admin"],
	}

	room := Room{
		RoomID:           data["room"],
		ProblemStatement: data["problemStatementPath"],
		Admin:            admin,
		RoomName:         data["roomName"],
		Code:             "",
		Users:            []User{admin},
	}

	exists, err := rdb.Exists(ctx, "room:"+room.RoomID).Result()
	if err != nil {
		log.Fatalf("Failed to check if room exists: %v", err)
	}
	if exists != 0 {
		fmt.Println("Room already exists with ID:", room.RoomID)
		return
	}

	jsonData, err := json.Marshal(room)
	if err != nil {
		log.Fatalf("Error serializing Room data: %v", err)
	}

	err = rdb.Set(ctx, "room:"+room.RoomID, jsonData, 0).Err()
	if err != nil {
		log.Fatalf("Failed to save room data to Redis: %v", err)
	}

	fmt.Println("Room data saved to Redis successfully")
}

func handleDeleteRoom(data map[string]string) {
	fmt.Println("Handling delete room with data:", data)
}

func handleUserJoined(data map[string]string) {
	fmt.Println("User joined with data:", data)
}

func handleUserLeft(data map[string]string) {
	fmt.Println("User left with data:", data)
}

func handleChangeAdmin(data map[string]string) {
	fmt.Println("Admin changed with data:", data)
}

func handleChangeProblem(data map[string]string) {
	fmt.Println("Problem statement changed with data:", data)
}
