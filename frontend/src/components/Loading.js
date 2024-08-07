import React from 'react';
import { AiOutlineLoading } from "react-icons/ai";

function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-75">
      {/* <AiOutlineLoading className="animate-spin text-blue-500 text-6xl" /> */}
      <img src="/logo.png" alt="Logo" className="h-60 w-auto animate-fadeInOut" />
    </div>
  )
}

export default Loading;
