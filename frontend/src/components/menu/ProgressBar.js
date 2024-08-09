import React from 'react';

function ProgressBar({ currentStep }) {
  return (
    <div className="flex justify-center items-center mb-6">
      <div className={`w-6 h-6 ${currentStep >= 1 ? 'bg-blue-600' : 'bg-gray-300'} rounded-full flex items-center justify-center text-white`}>
        1
      </div>
      <div className={`h-1 w-16 ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
      <div className={`w-6 h-6 ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-300'} rounded-full flex items-center justify-center text-white`}>
        2
      </div>
      <div className={`h-1 w-16 ${currentStep >= 3 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
      <div className={`w-6 h-6 ${currentStep >= 3 ? 'bg-blue-600' : 'bg-gray-300'} rounded-full flex items-center justify-center text-white`}>
        3
      </div>
    </div>
  );
}

export default ProgressBar;
