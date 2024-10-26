package redis

import (
    "websocket-service/instance"
    "websocket-service/messages"
)

var connMutex = instance.GetConnMutex()

func handleDeleteRoomFromChannel(data map[string]string) {
    roomID := data["roomID"]

    messages.CloseRoomConnections(roomID)
}

func handleUserJoinedFromChannel(data map[string]string) {
    roomID := data["roomID"]
    username := data["username"]

    messages.SendMessageToRoom(roomID, "UserJoined", "User joined the room!", username, nil)
}

func handleUserLeftFromChannel(data map[string]string) {
    roomID := data["roomID"]
    username := data["username"]

    messages.SendMessageToRoom(roomID, "UserLeft", "User left the room!", username, nil)
}

func handleChangeAdminFromChannel(data map[string]string) {
    roomID := data["roomID"]
    admin := data["newAdmin"]

    messages.SendMessageToRoom(roomID, "AdminChanged", "Admin changed!", admin, nil)
}

func handleChangeProblemFromChannel(data map[string]string) {
    roomID := data["roomID"]
    problem := data["problemStatement"]

    messages.SendMessageToRoom(roomID, "ProblemChanged", "Problem changed!", problem, nil)
}

func handleCodeChangeFromChannel(data map[string]string) {
	roomID := data["roomID"]
	codeContent := data["content"]

	messages.SendMessageToRoom(roomID, "CodeChange", "Code updated!", codeContent, nil)
}

func handleCursorChangeFromChannel(data map[string]string) {
	roomID := data["roomID"]
	cursorData := data["content"]

	messages.SendMessageToRoom(roomID, "CursorChange", "Cursor position updated!", cursorData, nil)
}

func handleRemoveConnection(data map[string]string) {
    userID := data["userID"]
    roomID := data["roomID"]
    connID := data["connID"]

    connMutex.Lock()
    defer connMutex.Unlock()
    connections := roomConnections[roomID]
    for i, c := range connections {
        if c.RemoteAddr().String() == connID {
            roomConnections[roomID] = append(connections[:i], connections[i+1:]...)
            break
        }
    }

    rdb.HDel(ctx, "userConnections", userID)
}