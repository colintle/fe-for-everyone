package main

// User represents a user with a unique ID, username, and associated room ID
type User struct {
	UserID   string `json:"userID"`
	Username string `json:"username"`
    RoomID string `json:"roomID"`
}

// Room represents a room with an admin user, unique room ID, problem statement, room name, and code
type Room struct {
	Admin User `json:"admin"`
	RoomID string `json:"roomID"`
	ProblemStatement string  `json:"problemStatement"`
	RoomName string `json:"roomName"`
	Code string `json:"code"`
}

// RoomDetail represents detailed information about a room, including welcome message, list of users, and room info
type RoomDetail struct {
    Content   string `json:"welcome"`
    Users     []User `json:"users"`
    RoomInfo  Room `json:"roomInfo"`
}

// WebSocketResponse represents a response sent over WebSocket with a type, content, and optional data
type WebSocketResponse struct {
    Type    string `json:"type"`
    Content string `json:"content"`
    Data    interface{} `json:"data,omitempty"`
}

// WebSocketMessage represents a message sent over WebSocket with a type and content
type WebSocketMessage struct {
    Type    string `json:"type"`
    Content interface{} `json:"content"`
}