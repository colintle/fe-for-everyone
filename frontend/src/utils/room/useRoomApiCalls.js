import { useApi } from "../api/useApi";
import { GET, POST } from "../api/methods";

export const useRoomApiCalls = () => {
    const { callApi } = useApi();

    const isJoined = async () => {
        const response = await callApi(`/room/hasJoined`, GET);
        if (response?.error) {
          return false;
        }
        return true;
    }

    return {
        isJoined
    };
};