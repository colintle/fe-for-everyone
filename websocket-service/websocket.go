package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"github.com/go-redis/redis/v8"
	"github.com/gorilla/websocket"
)

func handleSubscribers(channelName string, msg *redis.Message) {
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
    roomID := r.URL.Path[len("/ws/"):]

    if !checkRoomExists(roomID, w) {
        return
    }

    conn, err := upgrader.Upgrade(w, r, nil)
    if err != nil {
        fmt.Println("Error upgrading to WebSocket:", err)
        return
    }
    defer conn.Close()

    addConnection(roomID, conn)
    defer removeConnection(roomID, conn)

    sendInitialData(roomID, conn)

    fmt.Printf("Joined room: %s\n", roomID)
    handleMessages(roomID, conn)
}

func checkRoomExists(roomID string, w http.ResponseWriter) bool {
    exists, err := rdb.Exists(ctx, "room:"+roomID).Result()
    if err != nil {
        http.Error(w, "Internal server error", http.StatusInternalServerError)
        return false
    }
    if exists == 0 {
        http.Error(w, "Room not found", http.StatusNotFound)
        return false
    }
    return true
}

func addConnection(roomID string, conn *websocket.Conn) {
    connMutex.Lock()
    roomConnections[roomID] = append(roomConnections[roomID], conn)
    connMutex.Unlock()
}

func removeConnection(roomID string, conn *websocket.Conn) {
    connMutex.Lock()
    defer connMutex.Unlock()
    connections := roomConnections[roomID]
    for i, c := range connections {
        if c == conn {
            roomConnections[roomID] = append(connections[:i], connections[i+1:]...)
            break
        }
    }
}

func sendInitialData(roomID string, conn *websocket.Conn) {
    initialData, err := fetchInitialRoomData(roomID)
    if err != nil {
        fmt.Println("Error fetching initial room data:", err)
        return
    }
    jsonData, err := json.Marshal(initialData)
    if err != nil {
        fmt.Println("Error marshaling initial data:", err)
        return
    }
    conn.WriteMessage(websocket.TextMessage, jsonData)
}

func handleMessages(roomID string, conn *websocket.Conn) {
    for {
        _, msgBytes, err := conn.ReadMessage()
        if err != nil {
            fmt.Println("Error reading message:", err)
            break
        }

        var message WebSocketMessage
        if err := json.Unmarshal(msgBytes, &message); err != nil {
            fmt.Println("Error parsing message:", err)
            continue
        }

        switch message.Type {
        case "CodeChange":
            handleCodeChange(message, conn, roomID)
        default:
            fmt.Printf("Unhandled message type %s in room %s\n", message.Type, roomID)
        }
    }
}