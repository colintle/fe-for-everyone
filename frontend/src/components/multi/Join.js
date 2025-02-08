import React from 'react';
import { IoIosClose } from "react-icons/io";

import Popup from '../Popup';

function Join({ setJoin }) {
  return (
    <Popup onClose={() => setJoin(false)}>
      <div className="relative">
        <button 
          onClick={() => setJoin(false)} 
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 transition duration-150"
        >
          <IoIosClose size={24} />
        </button>
        <div className="text-center">
          <h2 className="text-xl font-bold mb-4">Join</h2>
          <p>Your content goes here...</p>
        </div>
      </div>
    </Popup>
  );
}

export default Join;
