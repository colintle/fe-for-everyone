import { useApi } from "../api/useApi";
import { GET, POST } from "../api/methods";

export const useRoomApiCalls = () => {
    const { callApi } = useApi();

    const isJoined = async () => {
        const response = await callApi(`/room/hasJoined`, GET);
        if (response?.error) {
          return false;
        }
        // {room (this is the id to invite others), role, problemStatementPath, admin (admin's username), adminID, roomName}
        return response;
    }

    const leaveRoom = async () => {
        const response = await callApi(`/room/leave`, GET);
        if (response?.error) {
          return false;
        }
        return true;
    }

    const createRoom = async (roomName, problemStatementPath) => {
        const response = await callApi(`/room/create`, POST, { roomName, problemStatementPath });
        if (response?.error) {
          return { error: true, message: response.error };
        }
        // {room (this is the id to invite others), roomName, problemStatementPath, admin (admin's username), adminID, message}
        return response;
    }

    const joinRoom = async (roomID) => {
        const response = await callApi(`/room/join`, POST, { roomID });
        if (response?.error) {
          return { error: true, message: response.error };
        }
        // {room (this is the id to invite others), roomName, problemStatementPath, admin (admin's username), adminID, message}
        return response;
    }

    return {
        isJoined,
        leaveRoom,
        createRoom,
        joinRoom
    };
};