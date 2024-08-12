import React from 'react';

function Step3({ data, prevStep, submit }) {
  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-center mb-6">Confirm Your Details</h2>
      <div className="mb-4">
        <p><strong>Mode:</strong> {data.mode}</p>
      </div>
      <div className="mb-4">
        <p><strong>Exam:</strong> {data.exam}</p>
      </div>
      {data.mode === "Multi" && <div className="mb-4">
        <p><strong>Room Name:</strong> {data.roomName}</p>
      </div>}
      <div className="flex justify-between">
        <button
          onClick={prevStep}
          className="bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition duration-200"
        >
          Back
        </button>
        <button
          onClick={submit}
          className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-200"
        >
          Confirm
        </button>
      </div>
    </div>
  );
}

export default Step3;
