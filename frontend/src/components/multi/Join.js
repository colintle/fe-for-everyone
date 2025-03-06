import React, { useState, useContext } from 'react';
import { IoIosClose } from "react-icons/io";

import { MyContext } from '../../MyProvider';
import { useRoomApiCalls } from '../../utils/room/useRoomApiCalls';
import Popup from '../Popup';

function Join({ setJoin }) {
  const { joinRoom, leaveRoom, isJoined } = useRoomApiCalls();
  const { setMulti, setRoomData } = useContext(MyContext);
  const [roomId, setRoomId] = useState('');
  const [message, setMessage] = useState('');

  const handleJoin = async () => {
    const response = await joinRoom(roomId);
    if (response.error) {
      setMessage('Error joining the room. Please try again.');
      return;
    }
    // redirect to /code
  };

  return (
    <Popup onClose={() => setJoin(false)}>
      <div className="relative">
        <button 
          onClick={() => setJoin(false)} 
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 transition duration-150"
        >
          <IoIosClose size={24} />
        </button>
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
      </div>
    </Popup>
  );
}

export default Join;
