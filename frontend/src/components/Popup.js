import React from 'react';

const Popup = ({ children, onClose }) => {

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center bg-gray-900 bg-opacity-50" onClick={handleOverlayClick}>
      <div className="bg-white p-6 z-20 rounded-lg shadow-lg max-w-lg w-screen overflow-auto" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
};

export default Popup;
