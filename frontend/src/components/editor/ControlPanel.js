import React from 'react';
import { MdDownload, MdOutlineCheckCircle, MdOutlineCircle, MdPlayArrow, MdStop, MdOutlineExitToApp } from "react-icons/md";
import Timer from './Timer';

function ControlPanel({ 
  isRunning, 
  isCompleted, 
  onRunCode, 
  onToggleCompletion, 
  onStartStopTimer, 
  onDownload, 
  onExit,
  timeLeft 
}) {
  return (
    <div className="flex justify-between items-center mb-4">
      <button onClick={onRunCode} className={`bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition duration-200 ${!isRunning ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={!isRunning}>
        Run Code
      </button>
      <Timer timeLeft={timeLeft} />
      <div className="flex items-center">
        <div onClick={onToggleCompletion} className="mr-2" title="Toggle Completion">
          {isCompleted ? <MdOutlineCheckCircle className="text-blue-600 text-2xl cursor-pointer" /> : <MdOutlineCircle className="text-blue-600 text-2xl cursor-pointer" />}
        </div>
        <div onClick={onStartStopTimer} className="mr-2" title={isRunning ? "Stop Timer" : "Start Timer"}>
          {isRunning ? <MdStop className="text-blue-600 text-2xl cursor-pointer" /> : <MdPlayArrow className="text-blue-600 text-2xl cursor-pointer" />}
        </div>
        <MdDownload onClick={onDownload} className="text-blue-600 text-2xl cursor-pointer hover:text-blue-700 mr-2" title="Download Code" />
        <MdOutlineExitToApp onClick={onExit} className="text-blue-600 text-2xl cursor-pointer hover:text-blue-700" title="Exit" />
      </div>
    </div>
  );
}

export default ControlPanel;
