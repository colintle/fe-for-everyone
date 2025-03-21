import React, { useState } from 'react';

function Step1({ nextStep }) {
  const [selectedMode, setSelectedMode] = useState('');
  const [roomName, setRoomName] = useState('');

  const handleSelection = (mode) => {
    setSelectedMode(mode);
    if (mode !== 'Multi') {
      setRoomName(''); // Clear room name if mode is not Multi
    }
  };

  const handleNextClick = () => {
    if (selectedMode) {
      nextStep({
        mode: selectedMode,
        roomName: selectedMode === 'Multi' ? roomName : '',
      });
    }
  };

  const description = selectedMode === 'Single'
    ? 'Single-Player Mode allows users to study independently, providing a focused environment for practicing coding problems and preparing for the Foundation Exam at UCF.'
    : selectedMode === 'Multi'
    ? 'Multi-Player Mode enables real-time collaboration, where users can join shared rooms to solve coding problems together, enhancing learning through group interaction and peer support.'
    : 'Description of the selected mode';

  return (
    <div className="w-full mx-auto">
      <h2 className="text-2xl font-bold text-center mb-6">Select Mode</h2>
      <div className="flex justify-center space-x-4 mb-6">
        <label className="flex items-center space-x-2">
          <input
            type="radio"
            name="mode"
            value="Single"
            checked={selectedMode === 'Single'}
            onChange={() => handleSelection('Single')}
          />
          <span>Single Player</span>
        </label>
        <label className="flex items-center space-x-2">
          <input
            type="radio"
            name="mode"
            value="Multi"
            checked={selectedMode === 'Multi'}
            onChange={() => handleSelection('Multi')}
          />
          <span>Multi-Player</span>
        </label>
      </div>
      <p className="text-center text-gray-600 mb-6">
        {description}
      </p>
      
      {selectedMode === 'Multi' && (
        <div className="mb-6">
          <label htmlFor="roomName" className="block text-gray-700 mb-2">
            Room Name
          </label>
          <input
            type="text"
            id="roomName"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            placeholder="Enter your room name"
          />
        </div>
      )}
      
      <div className="flex justify-center">
        <button
          onClick={handleNextClick}
          disabled={!selectedMode || (selectedMode === 'Multi' && !roomName)}
          className={`w-16 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-200 ${
            !selectedMode || (selectedMode === 'Multi' && !roomName) ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default Step1;
