import React, { useState, useContext, useEffect } from 'react';
import { IoIosClose } from "react-icons/io";
import { useNavigate } from 'react-router-dom';

import { MyContext } from '../../MyProvider';
import { useRoomApiCalls } from '../../utils/room/useRoomApiCalls';
import Popup from '../Popup';

const JoinMenu = ({roomId, setRoomId, handleJoin, message}) => {
  return (
    <div className="flex flex-col items-center">
      <h2 className="text-xl font-bold mb-4">
        Join Room
      </h2>
        <>
          <p className="text-gray-600">Enter the room ID to join the room.</p>
          <input
            type="text"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            className="w-4/5 h-10 mt-4 border border-gray-300 rounded-md px-2 focus:outline-none focus:ring focus:ring-blue-200"
          />
          <button 
            onClick={handleJoin}
            className="w-4/5 h-10 mt-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-150"
          >
            Join
          </button>
        </>
      <p className="mt-4 text-sm text-gray-500">
        {message}
      </p>
    </div>
  )
}

const LeaveMenu = ({roomData, redirectToCode, handleLeave, message}) => {
  return (
    <div className="flex flex-col items-center">
      <h2 className="text-xl font-bold mb-4">
        Leave Room
      </h2>
      <p className="text-gray-600">You are already in a room. Do you want to leave?</p>
      <button 
        onClick={handleLeave}
        className="w-4/5 h-10 mt-4 bg-red-500 text-white rounded-md hover:bg-red-600 transition duration-150"
      >
        Leave
      </button>
      <button 
        onClick={() => redirectToCode(roomData.roomName, roomData.problemStatementPath, roomData)}
        className="w-4/5 h-10 mt-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-150"
      >
        Go to Room
      </button>
      <p className="mt-4 text-sm text-gray-500">
        {message}
      </p>
    </div>
  )
}

function Join({ setJoin }) {
  const { joinRoom, leaveRoom, isJoined } = useRoomApiCalls();
  const { setMulti, setRoomData, setLoading } = useContext(MyContext);
  const [roomId, setRoomId] = useState('');
  const [message, setMessage] = useState('');
  const [joined, setJoined] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkJoined = async () => {    
      const response = await isJoined();  
      if (response?.room) {
        setJoined(response);
      }
    }
    checkJoined();
  }, [isJoined, setJoin, setLoading])

  const redirectToCode = (roomName, problemStatementPath, roomData) => {
    setMulti({ mode: 'Multi', roomName, exam: problemStatementPath });
    setRoomData(roomData);
    navigate("/code");
  }

  const handleJoin = async () => {
    setLoading(true)
    if (roomId === '') {
      setMessage('Please enter a room')
      return;
    }

    const response = await joinRoom(roomId);
    if (response.error) {
      setMessage('Error joining the room. Please try again.');
      setTimeout(() => setJoin(false), 3000);
      return;
    }

    redirectToCode(response.roomName, response.problemStatementPath, response);
    setLoading(false)
  };

  const handleLeave = async () => {
    setLoading(true)
    const response = await leaveRoom();
    if (response.error) {
      setMessage('Error leaving the room. Please try again.');
      setTimeout(() => setJoin(false), 3000);
      return;
    }

    setJoined(false);
    setMessage('You have left the room.');
    setLoading(false)
  }

  return (
    <Popup onClose={() => setJoin(false)}>
      <div className="relative">
        <button 
          onClick={() => setJoin(false)} 
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 transition duration-150"
        >
          <IoIosClose size={24} />
        </button>
        
        {joined ? 
        <LeaveMenu roomData={joined} redirectToCode={redirectToCode} handleLeave={handleLeave} message={message}/> 
        : <JoinMenu roomId={roomId} setRoomId={setRoomId} handleJoin={handleJoin} message={message} />
        }
      </div>
    </Popup>
  );
}

export default Join;
