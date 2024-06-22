package main

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/dgrijalva/jwt-go"
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
	// Extract roomID and token from query parameters
	roomID := r.URL.Query().Get("roomID")
	tokenStr := r.URL.Query().Get("token")

	if roomID == "" || tokenStr == "" {
		http.Error(w, "Missing roomID or token", http.StatusBadRequest)
		return
	}

	if !checkRoomExists(roomID, w) {
		return
	}

    token, err := parseJWTToken(tokenStr)

	if err != nil || !token.Valid {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}
	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok || !token.Valid {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

    userID := fmt.Sprintf("%.0f", claims["userID"].(float64))
	userData, err := rdb.Get(ctx, "user:"+userID).Result()
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var user User
	err = json.Unmarshal([]byte(userData), &user)
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	if user.RoomID != roomID {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
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

func parseJWTToken(tokenStr string) (*jwt.Token, error) {
    base64Secret := os.Getenv("ACCESS_KEY")
    base64Secret = ensureBase64Padding(base64Secret)
    secretKey, err := base64.URLEncoding.DecodeString(base64Secret)
    if err != nil {
        return nil, fmt.Errorf("failed to decode secret key from base64: %v", err)
    }

    return jwt.Parse(tokenStr, func(token *jwt.Token) (interface{}, error) {
        if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
            return nil, fmt.Errorf("Unexpected signing method: %v", token.Header["alg"])
        }
        return secretKey, nil
    })
}

func ensureBase64Padding(value string) string {
    missing := len(value) % 4
    if missing != 0 {
        value += strings.Repeat("=", 4-missing)
    }
    return value
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