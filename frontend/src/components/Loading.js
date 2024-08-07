import React from 'react';
import { AiOutlineLoading } from "react-icons/ai";

function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-25">
      <AiOutlineLoading className="animate-spin text-blue-500 text-6xl" />
    </div>
  )
}

export default Loading;
