package main

type User struct {
	UserID   string `json:"userID"`
	Username string `json:"username"`
}

type Room struct {
	Admin User `json:"admin"`
	RoomID string `json:"roomID"`
	ProblemStatement string  `json:"problemStatement"`
	RoomName string `json:"roomName"`
	Code string `json:"code"`
}

type WebSocketResponse struct {
    Type    string `json:"type"`
    Content string `json:"content"`
    Data    interface{} `json:"data,omitempty"`
}

type RoomDetail struct {
    Content   string `json:"welcome"`
    Users     []User `json:"users"`
    RoomInfo  Room `json:"roomInfo"`
}

type WebSocketMessage struct {
    Type    string `json:"type"`
    Content string `json:"content"`
    RoomID  string `json:"roomID"`
}