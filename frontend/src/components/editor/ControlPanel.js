import React from 'react';
import { MdDownload, MdCheckCircle, MdOutlineCircle, MdPlayArrow, MdStop, MdExitToApp, MdPeople, MdOutlineSend } from "react-icons/md";
import Timer from './Timer';

function ControlPanel({ 
  isRunning, 
  isCompleted, 
  onRunCode, 
  onToggleCompletion, 
  onStartStopTimer, 
  onDownload,
  onMembers,
  onInvite,
  onExit,
  timeLeft,
  isMulti,

}) {
  return (
    <div className="flex justify-between items-center mb-4">
      <button onClick={onRunCode} className={`bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition duration-200 ${!isRunning ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={!isRunning}>
        Run Code
      </button>
      <div className='flex items-center'>
        {!isMulti && <Timer timeLeft={timeLeft} />}
      </div>
      <div className="flex items-center"> 
        {isMulti && <MdPeople onClick={onMembers} className="text-blue-600 text-2xl cursor-pointer hover:text-blue-700 mr-2" title="View Members" />} 
        {isMulti && <MdOutlineSend onClick={onInvite} className="text-blue-600 text-2xl cursor-pointer hover:text-blue-700 mr-2" title="View Invite Link" />}
        {
        !isMulti && 
        <div onClick={onToggleCompletion} className="mr-2" title="Toggle Completion">
          {isCompleted ? <MdCheckCircle className="text-blue-600 text-2xl cursor-pointer" /> : <MdOutlineCircle className="text-blue-600 text-2xl cursor-pointer" />}
        </div>
        }
        {
        !isMulti &&
        <div onClick={onStartStopTimer} className="mr-2" title={isRunning ? "Stop Timer" : "Start Timer"}>
          {isRunning ? <MdStop className="text-blue-600 text-2xl cursor-pointer" /> : <MdPlayArrow className="text-blue-600 text-2xl cursor-pointer" />}
        </div>
        }
        <MdDownload onClick={onDownload} className="text-blue-600 text-2xl cursor-pointer hover:text-blue-700 mr-2" title="Download Code" />
        <MdExitToApp onClick={onExit} className="text-blue-600 text-2xl cursor-pointer hover:text-blue-700" title="Exit" />
      </div>
    </div>
  );
}

export default ControlPanel;
