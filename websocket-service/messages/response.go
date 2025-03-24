package messages

import (
	"encoding/json"
	"log"

	"github.com/gorilla/websocket"
    "websocket-service/models"
    "websocket-service/instance"
)

var connMutex = instance.GetConnMutex()
var roomConnections = instance.GetRoomConnections()

// SendMessageToRoom sends a message to all clients connected to a specific room, except the sender.
func SendMessageToRoom(roomID string, messageType string, content string, data interface{}, senderConn *websocket.Conn) {

    // Create a WebSocketResponse message
    msg := models.WebSocketResponse{
        Type:    messageType,
        Content: content,
        Data:    data,
    }

    // Serialize the message to JSON
    msgBytes, err := json.Marshal(msg)
    if err != nil {
        // Log error if serialization fails
        log.Printf("Failed to serialize message: %v", err)
        return
    }

    // Lock the connection mutex to safely access the roomConnections map
    connMutex.Lock()
    connections := roomConnections[roomID]
    connMutex.Unlock()

    // Iterate over all connections in the room
    for _, conn := range connections {
        // Skip sending the message to the sender
        if conn != senderConn {
            // Send the message to the client
            if err := conn.WriteMessage(websocket.TextMessage, msgBytes); err != nil {
                log.Printf("Error sending message to room %s: %v\n", roomID, err)
                continue
            }
        }
    }
}

// CloseRoomConnections closes all connections in a specific room and sends a delete notification.
func CloseRoomConnections(roomID string) {
    connMutex.Lock()
    connections, exists := roomConnections[roomID]
    if exists {
        delete(roomConnections, roomID)

        message := models.WebSocketResponse{
            Type:    "RoomDeleted",
            Content: "This room has been deleted.",
            Data:    nil,
        }

        messageBytes, err := json.Marshal(message)
        if err != nil {
            log.Printf("Error marshaling message: %v", err)
            connMutex.Unlock()
            return
        }

        // Iterate over all connections in the room
        for _, conn := range connections {
            if err := conn.WriteMessage(websocket.TextMessage, messageBytes); err != nil {
                log.Printf("Error sending delete notification: %v", err)
            }
            conn.Close()
        }
    }
    connMutex.Unlock()
}
