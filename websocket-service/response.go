package main

import (
	"encoding/json"
	"log"

	"github.com/gorilla/websocket"
)

func sendMessageToRoom(roomID string, messageType string, content string, data interface{}, senderConn *websocket.Conn) {
    msg := WebSocketResponse{
        Type:    messageType,
        Content: content,
        Data:    data,
    }

    msgBytes, err := json.Marshal(msg)
    if err != nil {
        log.Printf("Failed to serialize message: %v", err)
        return
    }

    connMutex.Lock()
    connections := roomConnections[roomID]
    connMutex.Unlock()

    for _, conn := range connections {
        if conn != senderConn {
            if err := conn.WriteMessage(websocket.TextMessage, msgBytes); err != nil {
                log.Printf("Error sending message to room %s: %v\n", roomID, err)
                continue
            }
        }
    }
}

func closeRoomConnections(roomID string) {
    connMutex.Lock()
    connections, exists := roomConnections[roomID]
    if exists {
        delete(roomConnections, roomID)
        message := WebSocketResponse{
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

        for _, conn := range connections {
            if err := conn.WriteMessage(websocket.TextMessage, messageBytes); err != nil {
                log.Printf("Error sending delete notification: %v", err)
            }
            conn.Close()
        }
    }
    connMutex.Unlock()
}