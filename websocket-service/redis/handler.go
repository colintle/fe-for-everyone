package redis

import (
	"encoding/json"
	"fmt"
	"log"

	"github.com/gorilla/websocket"

	"websocket-service/models"
	"websocket-service/messages"
)

func fetchInitialRoomData(roomID string) (interface{}, error) {
    var roomDetail models.RoomDetail

    userIDs, err := rdb.SMembers(ctx, "roomUsers:"+roomID).Result()
    if err != nil {
        return nil, fmt.Errorf("failed to retrieve user IDs for room %s: %v", roomID, err)
    }

    for _, userID := range userIDs {
        userData, err := rdb.Get(ctx, "user:"+userID).Result()
        if err != nil {
            fmt.Printf("Failed to retrieve data for user %s: %v", userID, err)
            continue 
        }

        var user models.User
        if err := json.Unmarshal([]byte(userData), &user); err != nil {
            fmt.Printf("Error unmarshaling user data: %v", err)
            continue
        }

        roomDetail.Users = append(roomDetail.Users, user)
    }

    roomInfo, err := rdb.Get(ctx, "room:"+roomID).Result()
    if err == nil {
		var room models.Room
		if err := json.Unmarshal([]byte(roomInfo), &room); err != nil {
            fmt.Printf("Error unmarshaling user data: %v", err)
        }

        roomDetail.RoomInfo = room
    }

    roomDetail.Content = fmt.Sprintf("Welcome to room %s", roomID)

    return roomDetail, nil
}

func handleCodeChange(message models.WebSocketMessage, conn *websocket.Conn, roomID string) {
	roomData, err := rdb.Get(ctx, "room:"+roomID).Result()
    if err != nil {
        log.Fatalf("Failed to retrieve room data for room %s: %v\n", roomID, err)
        return
    }

    var room models.Room
    err = json.Unmarshal([]byte(roomData), &room)
    if err != nil {
        log.Fatalf("Error deserializing room data: %v", err)
        return
    }

    codeContent := message.Content.(string)
    room.Code = codeContent

    updatedRoomData, err := json.Marshal(room)
    if err != nil {
        log.Fatalf("Error serializing updated room data: %v", err)
        return
    }

    err = rdb.Set(ctx, "room:"+roomID, updatedRoomData, 0).Err()
    if err != nil {
        log.Fatalf("Failed to update room data in Redis: %v", err)
        return
    }

    fmt.Printf("Code for room %s updated successfully\n", roomID)

	PublishMessageToChannel("code_change", map[string]string{
		"roomID":  roomID,
		"content": codeContent,
	})

    messages.SendMessageToRoom(roomID, "CodeChange", "Code updated!", room.Code, conn)
}

func handleCursorChange(content interface{}, conn *websocket.Conn, roomID string) {
    jsonContent, err := json.Marshal(content)
    if err != nil {
        log.Printf("Failed to serialize cursor change content: %v", err)
        return
    }

    PublishMessageToChannel("cursor_change", map[string]string{
        "roomID":  roomID,
        "content": string(jsonContent),
    })

    messages.SendMessageToRoom(roomID, "CursorChange", "Cursor position updated!", content, conn)
}
