package main

import (
	"encoding/json"
	"log"

	"github.com/gorilla/websocket"
)

// sendMessageToRoom sends a message to all clients connected to a specific room, except the sender.
func sendMessageToRoom(roomID string, messageType string, content string, data interface{}, senderConn *websocket.Conn) {

    // Create a WebSocketResponse message
    msg := WebSocketResponse{
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

// closeRoomConnections closes all connections in a specific room and sends a delete notification.
func closeRoomConnections(roomID string) {
    connMutex.Lock()
    connections, exists := roomConnections[roomID]
    if exists {
        // Delete the room from the map
        delete(roomConnections, roomID)

        // Create a WebSocketResponse message indicating the room has been deleted
        message := WebSocketResponse{
            Type:    "RoomDeleted",
            Content: "This room has been deleted.",
            Data:    nil,
        }

        // Serialize the message to JSON
        messageBytes, err := json.Marshal(message)
        if err != nil {
            log.Printf("Error marshaling message: %v", err)
            connMutex.Unlock()
            return
        }

        // Iterate over all connections in the room
        for _, conn := range connections {
            // Send the delete notification to the client
            if err := conn.WriteMessage(websocket.TextMessage, messageBytes); err != nil {
                log.Printf("Error sending delete notification: %v", err)
            }
            // Close the WebSocket connection
            conn.Close()
        }
    }
    // Unlock the connection mutex after accessing the roomConnections map
    connMutex.Unlock()
}