package instance

import (
	"sync"
	"os"
	"net/http"

	"github.com/google/uuid"
	"github.com/gorilla/websocket"
)

var instanceID = uuid.New().String()
var (
    roomConnections = make(map[string][]*websocket.Conn)
)
var upgrader = websocket.Upgrader{
    ReadBufferSize:  65536,
    WriteBufferSize: 65536,
    CheckOrigin: func(r *http.Request) bool {
        return r.Header.Get("Origin") == os.Getenv("FRONTEND_URL")
    },
}

var connMutex = &sync.Mutex{}

func GetConnMutex() *sync.Mutex {
	return connMutex
}

func GetUpgrader() websocket.Upgrader {
	return upgrader
}

func GetInstanceID() string {
	return instanceID
}

func GetRoomConnections() map[string][]*websocket.Conn {
	return roomConnections
}
