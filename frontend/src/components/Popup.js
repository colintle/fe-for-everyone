import React from 'react';

const Popup = ({ children }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-25">
      <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 max-w-lg h-1/2 max-h-screen overflow-auto">
        {children}
      </div>
    </div>
  );
};

export default Popup;
