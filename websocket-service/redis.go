package main

import (
	"fmt"
	"log"

	"github.com/go-redis/redis/v8"
)

func initializeRedis() {
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
}

func subscribeToRedis() {
	subscribeToChannel("create_room")
	subscribeToChannel("delete_room")
	subscribeToChannel("user_joined")
	subscribeToChannel("user_left")
	subscribeToChannel("change_admin")
	subscribeToChannel("change_problem")
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