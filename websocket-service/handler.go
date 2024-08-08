package main

import (
	"encoding/json"
	"fmt"
	"log"

	"github.com/gorilla/websocket"
)

// fetchInitialRoomData retrieves the initial room data and user details from Redis
func fetchInitialRoomData(roomID string) (interface{}, error) {
    var roomDetail RoomDetail

    // Get the user IDs in the room
    userIDs, err := rdb.SMembers(ctx, "roomUsers:"+roomID).Result()
    if err != nil {
        return nil, fmt.Errorf("failed to retrieve user IDs for room %s: %v", roomID, err)
    }

    // Retrieve each user's details and add to roomDetail
    for _, userID := range userIDs {
        userData, err := rdb.Get(ctx, "user:"+userID).Result()
        if err != nil {
            fmt.Printf("Failed to retrieve data for user %s: %v", userID, err)
            continue 
        }

        var user User
        if err := json.Unmarshal([]byte(userData), &user); err != nil {
            fmt.Printf("Error unmarshaling user data: %v", err)
            continue
        }

        roomDetail.Users = append(roomDetail.Users, user)
    }

    // Retrieve room info
    roomInfo, err := rdb.Get(ctx, "room:"+roomID).Result()
    if err == nil {
		var room Room
		if err := json.Unmarshal([]byte(roomInfo), &room); err != nil {
            fmt.Printf("Error unmarshaling user data: %v", err)
        }

        roomDetail.RoomInfo = room
    }

    // Add welcome message to roomDetail
    roomDetail.Content = fmt.Sprintf("Welcome to room %s", roomID)

    return roomDetail, nil
}

// handleCreateRoom handles the creation of a new room and updates Redis accordingly
func handleCreateRoom(data map[string]string) {
	admin := User{
		UserID:   data["adminID"],
		Username: data["admin"],
        RoomID: data["room"],
	}

	room := Room{
		RoomID:           data["room"],
		ProblemStatement: data["problemStatementPath"],
		Admin:            admin,
		RoomName:         data["roomName"],
		Code:             "",
	}

    // Check if room already exists
	exists, err := rdb.Exists(ctx, "room:"+room.RoomID).Result()
	if err != nil {
		log.Fatalf("Failed to check if room exists: %v", err)
	}
	if exists != 0 {
		fmt.Println("Room already exists with ID:", room.RoomID)
		return
	}

    // Save room data to Redis
	jsonData, err := json.Marshal(room)
	if err != nil {
		log.Fatalf("Error serializing Room data: %v", err)
	}

	err = rdb.Set(ctx, "room:"+room.RoomID, jsonData, 0).Err()
	if err != nil {
		log.Fatalf("Failed to save room data to Redis: %v", err)
	}

    // Add admin user to the room
	userDetails := map[string]string{
		"userID": data["adminID"],
		"user": data["admin"],
		"room": data["room"],
	}

	handleUserJoined(userDetails)

	fmt.Println("Room data saved to Redis successfully")
}

// handleDeleteRoom handles the deletion of a room and its associated data in Redis
func handleDeleteRoom(data map[string]string) {
    roomID := data["room"]

    // Delete all users in the room
    _, err := rdb.Del(ctx, "roomUsers:" + roomID).Result()
    if err != nil {
        log.Printf("Failed to delete user set for room %s from Redis: %v\n", roomID, err)
    }

    // Delete the room itself
    result, err := rdb.Del(ctx, "room:" + roomID).Result()
    if err != nil {
        log.Printf("Failed to delete room %s from Redis: %v\n", roomID, err)
        return
    }
    if result == 0 {
        fmt.Printf("No room found with ID %s to delete\n", roomID)
    } else {
        fmt.Printf("Room %s and associated user set deleted successfully\n", roomID)
        closeRoomConnections(roomID)
    }
}

// handleUserJoined handles adding a user to a room and updates Redis accordingly
func handleUserJoined(data map[string]string) {
    fmt.Println("User joined with data:", data)

    userID := data["userID"]
    username := data["user"]
    roomID := data["room"]

    // Check if the room exists
    exists, err := rdb.Exists(ctx, "room:"+roomID).Result()
    if err != nil {
        log.Fatalf("Failed to check if room exists: %v", err)
        return
    }
    if exists == 0 {
        fmt.Printf("No such room with ID %s exists\n", roomID)
        return
    }

    // Create user object and save to Redis
	user := User{
		UserID: userID,
		Username: username,
        RoomID: roomID,
	}

	jsonData, err := json.Marshal(user)
	if err != nil {
		log.Fatalf("Error serializing User data: %v", err)
	}

    err = rdb.Set(ctx, "user:" + userID, jsonData, 0).Err()
    if err != nil {
        log.Fatalf("Failed to store user details for %s: %v\n", userID, err)
        return
    }

    // Add user to the room's user set
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

    // Notify other users in the room
	customMessage := fmt.Sprintf("User %s has joined!", username)
    sendMessageToRoom(roomID, "UserJoined", customMessage, username, nil)
}

// handleUserLeft handles removing a user from a room and updates Redis accordingly
func handleUserLeft(data map[string]string) {
    fmt.Println("User left with data:", data)

    userID := data["userID"]
    roomID := data["room"]
	username := data["user"]

    fmt.Printf("User %s is leaving room %s\n", userID, roomID)

    // Remove user from the room's user set
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

    // Delete user data from Redis
    _, err = rdb.Del(ctx, "user:"+userID).Result()
    if err != nil {
        log.Printf("Failed to delete user data for %s: %v\n", userID, err)
    }

    // Notify other users in the room
	customMessage := fmt.Sprintf("User %s left!", username)
    sendMessageToRoom(roomID, "UserLeft", customMessage, username, nil)
}

// handleChangeAdmin handles changing the admin of a room and updates Redis accordingly
func handleChangeAdmin(data map[string]string) {
    fmt.Println("Admin changed with data:", data)

    roomID := data["room"]
    newAdminID := data["adminID"]
    newAdminUsername := data["admin"]

    // Retrieve current room data
    roomData, err := rdb.Get(ctx, "room:"+roomID).Result()
    if err != nil {
        log.Fatalf("Failed to retrieve room data for room %s: %v\n", roomID, err)
        return
    }

    // Unmarshal room data
    var room Room
    err = json.Unmarshal([]byte(roomData), &room)
    if err != nil {
        log.Fatalf("Error deserializing room data: %v", err)
        return
    }

    // Update admin information
    room.Admin = User{
        UserID: newAdminID,
        Username: newAdminUsername,
        RoomID: roomID,
    }

    // Save updated room data to Redis
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

    // Notify other users in the room
	customMessage := fmt.Sprintf("User %s has become admin!", newAdminUsername)
    sendMessageToRoom(roomID, "ChangeAdmin", customMessage, newAdminUsername, nil)
}

// handleChangeProblem handles changing the problem statement of a room and updates Redis accordingly
func handleChangeProblem(data map[string]string) {
    fmt.Println("Problem statement changed with data:", data)

    roomID := data["room"]
    newProblemStatement := data["problemStatementPath"]

    // Retrieve current room data
    roomData, err := rdb.Get(ctx, "room:"+roomID).Result()
    if err != nil {
        log.Fatalf("Failed to retrieve room data for room %s: %v\n", roomID, err)
        return
    }

    // Unmarshal room data
    var room Room
    err = json.Unmarshal([]byte(roomData), &room)
    if err != nil {
        log.Fatalf("Error deserializing room data: %v", err)
        return
    }

    // Update problem statement
    room.ProblemStatement = newProblemStatement

    // Save updated room data to Redis
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

    // Notify other users in the room
    sendMessageToRoom(roomID, "ChangeProblem", "Admin has changed the problem!", room.ProblemStatement, nil)
}

// handleCodeChange handles updating the code content in a room and updates Redis accordingly
func handleCodeChange(message WebSocketMessage, conn *websocket.Conn, roomID string) {
    // Retrieve current room data
	roomData, err := rdb.Get(ctx, "room:"+roomID).Result()
    if err != nil {
        log.Fatalf("Failed to retrieve room data for room %s: %v\n", roomID, err)
        return
    }

    // Unmarshal room data
    var room Room
    err = json.Unmarshal([]byte(roomData), &room)
    if err != nil {
        log.Fatalf("Error deserializing room data: %v", err)
        return
    }

    // Update code content
    codeContent := message.Content.(string)
    room.Code = codeContent

    // Save updated room data to Redis
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

    // Publish the code change to the "code_change" channel
	publishMessageToChannel("code_change", map[string]string{
		"roomID":  roomID,
		"content": codeContent,
	})

    // Notify other users in the room
    sendMessageToRoom(roomID, "CodeChange", "Code updated!", room.Code, conn)
}

func handleCursorChange(content interface{}, conn *websocket.Conn, roomID string) {
    // Convert content to JSON string
    jsonContent, err := json.Marshal(content)
    if err != nil {
        log.Printf("Failed to serialize cursor change content: %v", err)
        return
    }

    // Publish the cursor change to the "cursor_change" channel
    publishMessageToChannel("cursor_change", map[string]string{
        "roomID":  roomID,
        "content": string(jsonContent),
    })

    // Send the cursor change message to the room
    sendMessageToRoom(roomID, "CursorChange", "One cursor has been updated!", content, conn)
}


func handleCodeChangeFromChannel(data map[string]string) {
	roomID := data["roomID"]
	codeContent := data["content"]

	sendMessageToRoom(roomID, "CodeChange", "Code updated!", codeContent, nil)
}

func handleCursorChangeFromChannel(data map[string]string) {
	roomID := data["roomID"]
	cursorData := data["content"]

	sendMessageToRoom(roomID, "CursorChange", "Cursor position updated!", cursorData, nil)
}

func handleRemoveConnection(data map[string]string) {
    userID := data["userID"]
    roomID := data["roomID"]
    connID := data["connID"]

    // Remove the connection from the in-memory map
    connMutex.Lock()
    defer connMutex.Unlock()
    connections := roomConnections[roomID]
    for i, c := range connections {
        if c.RemoteAddr().String() == connID {
            roomConnections[roomID] = append(connections[:i], connections[i+1:]...)
            break
        }
    }

    // Remove the connection ID from Redis (if necessary)
    rdb.HDel(ctx, "userConnections", userID)
}