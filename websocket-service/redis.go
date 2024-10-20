package main

import (
	"fmt"
	"log"
	"encoding/json"

	"github.com/go-redis/redis/v8"
)

// initializeRedis initializes the connection to the Redis server
func initializeRedis() {
	// Create a new Redis client with specified options
	rdb = redis.NewClient(&redis.Options{
		Addr:     "redis:6379",
		Password: "",
		DB:       0,           
	})

	// Ping the Redis server to check the connection
	_, err := rdb.Ping(ctx).Result()
	if err != nil {
		// Log and exit if the connection fails
		log.Fatalf("Could not connect to Redis: %v", err)
	}
	// Print a success message if connected
	fmt.Println("Connected to Redis")
}

// subscribeToRedis subscribes to multiple Redis channels for receiving messages
func subscribeToRedis() {
	// Subscribe to various channels
	subscribeToChannel("create_room")
	subscribeToChannel("delete_room")
	subscribeToChannel("user_joined")
	subscribeToChannel("user_left")
	subscribeToChannel("change_admin")
	subscribeToChannel("change_problem")
	subscribeToChannel("code_change")
    subscribeToChannel("cursor_change")
}

// subscribeToChannel subscribes to a single Redis channel and handles incoming messages
func subscribeToChannel(channelName string) {
	// Subscribe to the specified channel
	pubsub := rdb.Subscribe(ctx, channelName)

	// Get the channel for receiving messages
	ch := pubsub.Channel()

	// Start a goroutine to handle messages from the channel
	go func() {
		for msg := range ch {
			// Handle each message received on the channel
			handleSubscribers(channelName, msg)
		}
	}()
}

func publishMessageToChannel(channel string, message map[string]string) {
	message["instanceID"] = instanceID // Add the instance ID to the message
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
