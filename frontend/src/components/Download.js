import React, { useState } from 'react';
import { IoIosClose } from "react-icons/io";

import Popup from './Popup';

function Download({ setClose, handleDownload }) {
  const [filename, setFilename] = useState('');

  const onDownloadClick = () => {
    handleDownload(filename);
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
        <div className="text-center">
          <h2 className="text-xl font-bold mb-4">Download Code</h2>
          <input
            type="text"
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
            placeholder="Enter filename"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 mb-4"
          />
          <button
            onClick={onDownloadClick}
            className={`bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200`}
          >
            Download
          </button>
        </div>
      </div>
    </Popup>
  );
}

export default Download;
