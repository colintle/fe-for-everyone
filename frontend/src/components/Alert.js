import React, { useEffect, useState, useContext } from 'react';
import { MyContext } from "../MyProvider"

const Alert = () => {
  const { message, setMessage } = useContext(MyContext);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setVisible(true);
      // Auto close alert after 3 seconds
      const timer = setTimeout(() => {
        setVisible(false);
        setMessage(null);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [message, setMessage]);

  if (!message || !visible) return null;

  return (
    <div 
      className="fixed top-5 left-1/2 transform -translate-x-1/2 bg-red-100 text-red-700 py-2 px-4 border border-red-200 rounded flex items-center z-50"
    >
      <span>{message}</span>
      <button
        onClick={() => {
          setVisible(false);
          setMessage(null);
        }}
        className="ml-2 bg-transparent border-0 font-bold cursor-pointer text-lg leading-none"
      >
        &times;
      </button>
    </div>
  );
};

export default Alert;
