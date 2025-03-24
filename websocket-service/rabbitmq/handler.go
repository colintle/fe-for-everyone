package rabbitmq

import (
	"encoding/json"
	"fmt"
	"log"

	"websocket-service/messages"
	"websocket-service/models"
	"websocket-service/redis"
)

func handleCreateRoom(data map[string]string) {
    var rdb = redis.GetRedisClient()
    var ctx = redis.GetRedisContext()

    fmt.Println("User created room with data:", data)

	admin := models.User{
		UserID:   data["adminID"],
		Username: data["admin"],
        RoomID: data["room"],
	}

	room := models.Room{
		RoomID:           data["room"],
		ProblemStatement: data["problemStatementPath"],
		Admin:            admin,
		RoomName:         data["roomName"],
		Code:             "",
	}

    if rdb == nil {
        log.Fatal("Redis client is nil. Check redis.GetRedisClient() initialization")
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
    var rdb = redis.GetRedisClient()
    var ctx = redis.GetRedisContext()

    fmt.Println("User deleted room with data:", data)

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
        redis.PublishMessageToChannel("delete_room", map[string]string{
            "roomID":  roomID,
        })
        messages.CloseRoomConnections(roomID)
    }
}

func handleUserJoined(data map[string]string) {
    var rdb = redis.GetRedisClient()
    var ctx = redis.GetRedisContext()

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

	user := models.User{
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
    redis.PublishMessageToChannel("user_joined", map[string]string{
        "roomID":  roomID,
        "username": username,
    })
    messages.SendMessageToRoom(roomID, "UserJoined", customMessage, username, nil)
}

func handleUserLeft(data map[string]string) {
    var rdb = redis.GetRedisClient()
    var ctx = redis.GetRedisContext()

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
    redis.PublishMessageToChannel("user_left", map[string]string{
        "roomID":  roomID,
        "username": username,
    })
    messages.SendMessageToRoom(roomID, "UserLeft", customMessage, username, nil)
}

func handleChangeAdmin(data map[string]string) {
    var rdb = redis.GetRedisClient()
    var ctx = redis.GetRedisContext()

    fmt.Println("Admin changed with data:", data)

    roomID := data["room"]
    newAdminID := data["adminID"]
    newAdminUsername := data["admin"]

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

    room.Admin = models.User{
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
    redis.PublishMessageToChannel("change_admin", map[string]string{
        "roomID":  roomID,
        "newAdmin": newAdminUsername,
    })
    messages.SendMessageToRoom(roomID, "ChangeAdmin", customMessage, newAdminUsername, nil)
}

func handleChangeProblem(data map[string]string) {
    var rdb = redis.GetRedisClient()
    var ctx = redis.GetRedisContext()
    
    fmt.Println("Problem statement changed with data:", data)

    roomID := data["room"]
    newProblemStatement := data["problemStatementPath"]

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

    redis.PublishMessageToChannel("change_problem", map[string]string{
        "roomID":  roomID,
        "problemStatement": room.ProblemStatement,
    })
    messages.SendMessageToRoom(roomID, "ChangeProblem", "Admin has changed the problem!", room.ProblemStatement, nil)
}
