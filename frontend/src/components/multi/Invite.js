import React, { useState } from "react";
import { IoIosClose } from "react-icons/io";
import { MdContentCopy } from "react-icons/md";

import Popup from "../Popup";

function Invite({ setClose, inviteCode }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <Popup onClose={() => setClose(false)}>
      <div className="relative">
        <button
          onClick={() => setClose(false)}
          className="absolute top-0 right-2 text-gray-500 hover:text-gray-700 transition duration-150"
        >
          <IoIosClose size={24} />
        </button>

        <h2 className="text-xl font-bold text-center mb-4">Invite Code</h2>

        <div className="flex items-center justify-between w-full px-2 py-2 border border-gray-300 rounded-lg mb-2">
          <span className="text-gray-700 font-medium">
            {inviteCode}
          </span>
          <button
            onClick={handleCopy}
            className="text-blue-500 hover:text-blue-700 focus:outline-none"
          >
            <MdContentCopy size={20} />
          </button>
        </div>

        {copied && (
          <p className="text-green-600 text-sm">
            Copied to clipboard!
          </p>
        )}
      </div>
    </Popup>
  );
}

export default Invite;
