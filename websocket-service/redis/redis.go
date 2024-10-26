package redis

import (
	"fmt"
	"log"
	"encoding/json"
	"context"

	"github.com/go-redis/redis/v8"

	"websocket-service/instance"
)

var instanceID = instance.GetInstanceID()

var (
	ctx = context.Background()
	rdb *redis.Client
)

func GetRedisClient() *redis.Client {
	return rdb
}

func GetRedisContext() context.Context {
	return ctx
}

func InitializeRedis() *redis.Client{
	rdb = redis.NewClient(&redis.Options{
		Addr:     "redis:6379",
		Password: "",
		DB:       0,           
	})

	_, err := rdb.Ping(ctx).Result()
	if err != nil {
		log.Fatalf("Could not connect to Redis: %v", err)
	}
	fmt.Println("Connected to Redis")
	return rdb
}

func SubscribeToRedis() {
	subscribeToChannel("delete_room")
	subscribeToChannel("user_joined")
	subscribeToChannel("user_left")
	subscribeToChannel("change_admin")
	subscribeToChannel("change_problem")
	subscribeToChannel("code_change")
    subscribeToChannel("cursor_change")
	subscribeToChannel("remove_connection")
}

func subscribeToChannel(channelName string) {
	pubsub := rdb.Subscribe(ctx, channelName)

	ch := pubsub.Channel()

	go func() {
		for msg := range ch {
			handleSubscribers(channelName, msg)
		}
	}()
}

// Publishing to Redis Channels
func PublishMessageToChannel(channel string, message map[string]string) {
	message["instanceID"] = instanceID
	msgBytes, err := json.Marshal(message)
	if err != nil {
		log.Printf("Error marshaling message for channel %s: %v", channel, err)
		return
	}

	err = rdb.Publish(ctx, channel, msgBytes).Err()
	if err != nil {
		log.Printf("Error publishing message to channel %s: %v", channel, err)
	}
}

// Handling Redis Channel Subscribers
func handleSubscribers(channelName string, msg *redis.Message) {
	var messageData map[string]string

	err := json.Unmarshal([]byte(msg.Payload), &messageData)
	if err != nil {
		log.Printf("Error parsing JSON data from channel %s: %v", channelName, err)
		return
	}

	if currInstanceID, ok := messageData["instanceID"]; ok && instance.GetInstanceID() == currInstanceID {
		return
	}

	switch channelName {
		case "delete_room":
			handleDeleteRoomFromChannel(messageData)
		case "user_joined":
			handleUserJoinedFromChannel(messageData)
		case "user_left":
			handleUserLeftFromChannel(messageData)
		case "change_admin":
			handleChangeAdminFromChannel(messageData)
		case "change_problem":
			handleChangeProblemFromChannel(messageData)
		case "code_change":
			handleCodeChangeFromChannel(messageData)
		case "cursor_change":
			handleCursorChangeFromChannel(messageData)
		case "remove_connection":
			handleRemoveConnection(messageData)
		default:
			log.Printf("Unhandled channel: %s", channelName)
	}
}
