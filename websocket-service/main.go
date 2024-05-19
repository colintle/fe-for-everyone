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
	roomID := data["room"]

	key := "room:" + roomID
    result, err := rdb.Del(ctx, key).Result()
    if err != nil {
        log.Printf("Failed to delete room %s from Redis: %v\n", roomID, err)
        return
    }
    if result == 0 {
        fmt.Printf("No room found with ID %s to delete\n", roomID)
    } else {
        fmt.Printf("Room %s deleted successfully\n", roomID)
    }

}

func handleUserJoined(data map[string]string) {
    fmt.Println("User joined with data:", data)

    userID := data["userID"]
    username := data["user"]
    roomID := data["room"]

    exists, err := rdb.Exists(ctx, "room:"+roomID).Result()
    if err != nil {
        log.Fatalf("Failed to check if room exists: %v", err)
        return
    }
    if exists == 0 {
        fmt.Printf("No such room with ID %s exists\n", roomID)
        return
    }

	user := User{
		UserID: userID,
		Username: username,
	}

	jsonData, err := json.Marshal(user)
	if err != nil {
		log.Fatalf("Error serializing User data: %v", err)
	}

    userKey := "user:" + userID
    err = rdb.Set(ctx, userKey, jsonData, 0).Err()
    if err != nil {
        log.Fatalf("Failed to store user details for %s: %v\n", userID, err)
        return
    }

    added, err := rdb.SAdd(ctx, "roomUsers:"+roomID, userID).Result()
    if err != nil {
        log.Fatalf("Failed to add user %s to room %s: %v\n", userID, roomID, err)
        return
    }
    if added > 0 {
        fmt.Printf("User %s added to room %s successfully\n", userID, roomID)
    } else {
        fmt.Printf("User %s already a member of room %s\n", userID, roomID)
    }
}

func handleUserLeft(data map[string]string) {
    fmt.Println("User left with data:", data)

    userID := data["userID"]
    roomID := data["room"]

    fmt.Printf("User %s is leaving room %s\n", userID, roomID)

    removed, err := rdb.SRem(ctx, "roomUsers:"+roomID, userID).Result()
    if err != nil {
        log.Fatalf("Failed to remove user %s from room %s: %v\n", userID, roomID, err)
        return
    }
    if removed > 0 {
        fmt.Printf("User %s removed from room %s successfully\n", userID, roomID)
    } else {
        fmt.Printf("User %s was not in room %s\n", userID, roomID)
    }

    _, err = rdb.Del(ctx, "user:"+userID).Result()
    if err != nil {
        log.Printf("Failed to delete user data for %s: %v\n", userID, err)
    }
}

func handleChangeAdmin(data map[string]string) {
    fmt.Println("Admin changed with data:", data)

    roomID := data["room"]
    newAdminID := data["adminID"]
    newAdminUsername := data["admin"]

    roomData, err := rdb.Get(ctx, "room:"+roomID).Result()
    if err != nil {
        log.Fatalf("Failed to retrieve room data for room %s: %v\n", roomID, err)
        return
    }

    var room Room
    err = json.Unmarshal([]byte(roomData), &room)
    if err != nil {
        log.Fatalf("Error deserializing room data: %v", err)
        return
    }

    room.Admin = User{
        UserID: newAdminID,
        Username: newAdminUsername,
    }

    updatedRoomData, err := json.Marshal(room)
    if err != nil {
        log.Fatalf("Error serializing updated room data: %v", err)
        return
    }

    err = rdb.Set(ctx, "room:"+roomID, updatedRoomData, 0).Err()
    if err != nil {
        log.Fatalf("Failed to update room data in Redis: %v", err)
    } else {
        fmt.Printf("Admin for room %s updated successfully to %s (%s)\n", roomID, newAdminUsername, newAdminID)
    }
}

func handleChangeProblem(data map[string]string) {
    fmt.Println("Problem statement changed with data:", data)

    roomID := data["room"]
    newProblemStatement := data["problemStatementPath"]

    roomData, err := rdb.Get(ctx, "room:"+roomID).Result()
    if err != nil {
        log.Fatalf("Failed to retrieve room data for room %s: %v\n", roomID, err)
        return
    }

    var room Room
    err = json.Unmarshal([]byte(roomData), &room)
    if err != nil {
        log.Fatalf("Error deserializing room data: %v", err)
        return
    }

    room.ProblemStatement = newProblemStatement

    updatedRoomData, err := json.Marshal(room)
    if err != nil {
        log.Fatalf("Error serializing updated room data: %v", err)
        return
    }

    err = rdb.Set(ctx, "room:"+roomID, updatedRoomData, 0).Err()
    if err != nil {
        log.Fatalf("Failed to update room data in Redis: %v", err)
    } else {
        fmt.Printf("Problem statement for room %s updated successfully to %s\n", roomID, newProblemStatement)
    }
}
