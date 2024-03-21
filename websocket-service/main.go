package main

import (
    "log"
    "net/http"
    "github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
    ReadBufferSize:  1024,
    WriteBufferSize: 1024,
}

func handleConnections(w http.ResponseWriter, r *http.Request) {
    ws, err := upgrader.Upgrade(w, r, nil)
    if err != nil {
        log.Fatal(err)
    }
    defer ws.Close()

    for {
        _, msg, err := ws.ReadMessage()
        if err != nil {
            log.Println("read:", err)
            break
        }
        log.Printf("recv: %s", msg)
        err = ws.WriteMessage(websocket.TextMessage, msg)
        if err != nil {
            log.Println("write:", err)
            break
        }
    }
}

func main() {
    http.HandleFunc("/ws", handleConnections)
    log.Println("WebSocket service starting on :8081...")
    err := http.ListenAndServe(":8081", nil)
    if err != nil {
        log.Fatal("ListenAndServe: ", err)
    }
}
