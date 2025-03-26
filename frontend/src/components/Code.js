import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { MyContext } from '../MyProvider';
import Multi from './multi/Multi';
import Single from './single/Single';
import Loading from './Loading';

import { useRoomApiCalls } from '../utils/room/useRoomApiCalls';

function Code() {
    const {
        setMessage,
        socket,
        setSocket,
        accessToken,
        single,
        multi,
        roomData,
        setRoomData,
        completedProblems,
    } = useContext(MyContext);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const {leaveRoom} = useRoomApiCalls();

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 5000);

        return () => clearTimeout(timer); 
    }, []);

    useEffect(() => {
        if (!single && !multi && !loading) {
            navigate("/");
        }
    }, [single, multi, loading, navigate]);

    useEffect(() => {
        const resetRoom = () => {
          setSocket(null);
          setRoomData({});
        };
    
        if (multi && roomData?.room && accessToken) {
          if (!socket) {
            const wsUrl = `${process.env.REACT_APP_WEBSOCKET_URL}/ws/?roomID=${roomData.room}&token=${accessToken}`;
            const newSocket = new WebSocket(wsUrl);
    
            newSocket.onopen = () => {
                setSocket(newSocket);
                setLoading(false);
                console.log("WebSocket connected");
            };
    
            newSocket.onerror = (error) => {
                console.error("WebSocket error:", error);
            };
    
            newSocket.onmessage = (event) => {
              console.log("Received WebSocket message:", event.data);
            };
    
            newSocket.onclose = (event) => {
              setLoading(true);
              resetRoom();
              console.log("WebSocket disconnected:", event);
            };
          }
        } else if (socket) {
          setLoading(true);
          socket.close();
          resetRoom();
          navigate("/");
        }
      }, [multi, roomData, accessToken, socket, navigate, setMessage, setSocket, setRoomData, leaveRoom]);
    
      useEffect(() => {
        return () => {
          if (socket) {
            socket.close();
          }
        };
      }, [socket]);

    const isCompleted = (examName) => {
        return completedProblems.some(problem => problem.problemStatementPath === examName);
    };

    if (loading) {
        return <Loading />;
    } else if (single) {
        const completed = isCompleted(single.exam);
        return <Single problem={single.exam} completed={completed} />;
    } else if (multi && socket) {
        const completed = isCompleted(multi.exam);
        return <Multi problem={multi.exam} completed={completed} inviteCode={roomData?.room} />;
    } else {
        return null;
    }
}

export default Code;
