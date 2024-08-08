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

// handleSubscribers handles messages from Redis channels and calls the appropriate handler function based on the channel name.
func handleSubscribers(channelName string, msg *redis.Message) {
	var messageData map[string]string

	// Parse the JSON payload from the Redis message
	err := json.Unmarshal([]byte(msg.Payload), &messageData)
	if err != nil {
		log.Printf("Error parsing JSON data from channel %s: %v", channelName, err)
		return
	}

	// Check if the message was sent by this instance
	if currInstanceID, ok := messageData["instanceID"]; ok && instanceID == currInstanceID {
		return // Ignore the message if it was sent by this instance
	}

	// Call the appropriate handler function based on the channel name
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
	case "code_change":
		handleCodeChangeFromChannel(messageData)
	case "cursor_change":
		handleCursorChangeFromChannel(messageData)
	default:
		log.Printf("Unhandled channel: %s", channelName)
	}
}


// roomHandler handles WebSocket connections for a specific room.
func roomHandler(w http.ResponseWriter, r *http.Request) {
	// Extract roomID and token from query parameters
	roomID := r.URL.Query().Get("roomID")
	tokenStr := r.URL.Query().Get("token")

	if roomID == "" || tokenStr == "" {
		http.Error(w, "Missing roomID or token", http.StatusBadRequest)
		return
	}

	// Check if the room exists in Redis
	if !checkRoomExists(roomID, w) {
		return
	}

	// Parse and validate the JWT token
    token, err := parseJWTToken(tokenStr)
	if err != nil || !token.Valid {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Extract claims from the token
	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok || !token.Valid {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Retrieve user data from Redis
    userID := fmt.Sprintf("%.0f", claims["userID"].(float64))
	userData, err := rdb.Get(ctx, "user:"+userID).Result()
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Unmarshal user data
	var user User
	err = json.Unmarshal([]byte(userData), &user)
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Check if the user belongs to the requested room
	if user.RoomID != roomID {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Upgrade the HTTP connection to a WebSocket connection
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		fmt.Println("Error upgrading to WebSocket:", err)
		return
	}
	defer conn.Close()

	// Add the WebSocket connection to the list of connections for the room
	addConnection(roomID, conn)
	defer removeConnection(roomID, conn)

	// Send initial data to the newly connected client
	sendInitialData(roomID, conn)

	fmt.Printf("Joined room: %s\n", roomID)

	// Handle incoming WebSocket messages
	handleMessages(roomID, conn)
}

// parseJWTToken parses and validates a JWT token.
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

// ensureBase64Padding ensures that the base64 encoded secret key has proper padding.
func ensureBase64Padding(value string) string {
    missing := len(value) % 4
    if missing != 0 {
        value += strings.Repeat("=", 4-missing)
    }
    return value
}

// checkRoomExists checks if a room exists in Redis and sends an error response if it doesn't.
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

// addConnection adds a WebSocket connection to the list of connections for a room.
func addConnection(roomID string, conn *websocket.Conn) {
    connMutex.Lock()
    roomConnections[roomID] = append(roomConnections[roomID], conn)
    connMutex.Unlock()
}

// removeConnection removes a WebSocket connection from the list of connections for a room.
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

// sendInitialData sends initial room data to a newly connected client.
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

// handleMessages handles incoming WebSocket messages.
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
		case "CursorChange":
			handleCursorChange(message.Content, conn, roomID)
        default:
            fmt.Printf("Unhandled message type %s in room %s\n", message.Type, roomID)
        }
    }
}