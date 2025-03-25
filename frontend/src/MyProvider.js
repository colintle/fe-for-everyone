import React, { useState, createContext, useEffect } from 'react';
import { refreshToken, getUsernameFromToken, clearToken } from './utils/token';

const MyContext = createContext();

function MyProvider({ children }) {
  const [loading, setLoading] = useState(true);
  const [single, setSingle] = useState(false);
  const [multi, setMulti] = useState(false);
  const [roomData, setRoomData] = useState({});
  const [username, setUsername] = useState("");
  const [completedProblems, setCompletedProblems] = useState([]);
  const [accessToken, setAccessToken] = useState("");
  const [logout, setLogout] = useState(false);
  const [socket, setSocket] = useState(null);

  const handleLogout = async () => {
    try {
      const cleared = await clearToken();
      if (!cleared) {
        throw new Error("Failed to clear token");
      }
      setLogout(true);
      setAccessToken("");
      setUsername("");
      if (socket) {
        socket.close();
        setSocket(null);
      }
      return true;
    } catch (error) {
      throw error;
    }
  };

  useEffect(() => {
    const grabToken = async () => {
      setLoading(true);
      const token = await refreshToken();
      if (token) {
        setAccessToken(token);
        setUsername(getUsernameFromToken(token));
        setLoading(false);
      } else {
        await handleLogout();
        setLoading(false);
      }
    };

    grabToken();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (multi && roomData && roomData?.room && accessToken) {
      if (!socket) {
        const wsUrl = `${process.env.REACT_APP_WEBSOCKET_URL}/ws/?roomID=${roomData.room}&token=${accessToken}`;
        const newSocket = new WebSocket(wsUrl);

        newSocket.onopen = () => {
          console.log("WebSocket connected");
        };

        newSocket.onmessage = (event) => {
          console.log("Received WebSocket message:", event.data);
        };

        newSocket.onclose = (event) => {
          setSocket(null);
          setRoomData({});
          console.log("WebSocket disconnected:", event);
        };

        setSocket(newSocket);
      }
    } else {
      if (socket) {
        socket.close();
        setSocket(null);
      }
    }
  }, [multi, roomData, accessToken, socket]);

  return (
    <MyContext.Provider
      value={{
        single,
        setSingle,
        multi,
        setMulti,
        accessToken,
        setAccessToken,
        completedProblems,
        setCompletedProblems,
        logout,
        setLogout,
        loading,
        setLoading,
        handleLogout,
        username,
        setUsername,
        roomData,
        setRoomData,
        socket,
        setSocket
      }}
    >
      {children}
    </MyContext.Provider>
  );
}

export { MyContext, MyProvider };
