package main

import (
	"encoding/json"
	"fmt"
	"log"

	"github.com/gorilla/websocket"
)

func fetchInitialRoomData(roomID string) (interface{}, error) {
    var roomDetail RoomDetail

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

        var user User
        if err := json.Unmarshal([]byte(userData), &user); err != nil {
            fmt.Printf("Error unmarshaling user data: %v", err)
            continue
        }

        roomDetail.Users = append(roomDetail.Users, user)
    }

    roomInfo, err := rdb.Get(ctx, "room:"+roomID).Result()
    if err == nil {
		var room Room
		if err := json.Unmarshal([]byte(roomInfo), &room); err != nil {
            fmt.Printf("Error unmarshaling user data: %v", err)
        }

        roomDetail.RoomInfo = room
    }

    roomDetail.Content = fmt.Sprintf("Welcome to room %s", roomID)

    return roomDetail, nil
}

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

	userDetails := map[string]string{
		"userID": data["adminID"],
		"user": data["admin"],
		"room": data["room"],
	}

	handleUserJoined(userDetails)

	fmt.Println("Room data saved to Redis successfully")
}

func handleDeleteRoom(data map[string]string) {
    roomID := data["room"]

    _, err := rdb.Del(ctx, "roomUsers:" + roomID).Result()
    if err != nil {
        log.Printf("Failed to delete user set for room %s from Redis: %v\n", roomID, err)
    }

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

	customMessage := fmt.Sprintf("User %s has joined!", username)
    sendMessageToRoom(roomID, "UserJoined", customMessage, username, nil)
}

func handleUserLeft(data map[string]string) {
    fmt.Println("User left with data:", data)

    userID := data["userID"]
    roomID := data["room"]
	username := data["user"]

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

	customMessage := fmt.Sprintf("User %s left!", username)
    sendMessageToRoom(roomID, "UserLeft", customMessage, username, nil)
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
        RoomID: roomID,
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

	customMessage := fmt.Sprintf("User %s has become admin!", newAdminUsername)
    sendMessageToRoom(roomID, "ChangeAdmin", customMessage, newAdminUsername, nil)
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

    sendMessageToRoom(roomID, "ChangeProblem", "Admin has changed the problem!", room.ProblemStatement, nil)
}

func handleCodeChange(message WebSocketMessage, conn *websocket.Conn, roomID string) {
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

    room.Code = message.Content

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

    sendMessageToRoom(roomID, "CodeChange", "Code updated!", room.Code, conn)
}
