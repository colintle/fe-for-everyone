import React, { useState } from 'react';
import { IoIosClose } from "react-icons/io";
import { MdTagFaces } from "react-icons/md";
import Popup from '../Popup';

function Members({ setClose, members, admin }) {
  const [searchTerm, setSearchTerm] = useState('');

  const showAdmin = admin.username
    .toLowerCase()
    .includes(searchTerm.toLowerCase());

  const filteredMembers = members
    .filter((m) => m.userID !== admin.userID)
    .filter((m) =>
      m.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <Popup onClose={() => setClose(false)}>
      <div className="relative">
        <button
          onClick={() => setClose(false)}
          className="absolute top-0 right-2 text-gray-500 hover:text-gray-700 transition duration-150"
        >
          <IoIosClose size={24} />
        </button>

        <h2 className="text-xl font-bold text-center mb-4">Members</h2>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Search members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 
                       focus:outline-none focus:border-blue-400"
          />
        </div>

        <div className="h-64 overflow-y-auto border border-gray-200 rounded-lg">
          {showAdmin && (
            <div className="flex items-center space-x-2 p-2 border-b">
              <MdTagFaces className="text-blue-800" />
              <span className="text-blue-800 font-semibold">
                {admin.username}
              </span>
            </div>
          )}

          {filteredMembers.map((member) => (
            <div
              key={member.userID}
              className="flex items-center space-x-2 p-2 border-b"
            >
              <MdTagFaces className="text-blue-600" />
              <span className="text-blue-600">{member.username}</span>
            </div>
          ))}
        </div>
      </div>
    </Popup>
  );
}

export default Members;
