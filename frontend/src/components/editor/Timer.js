import React from 'react';

function Timer({ timeLeft }) {
  return (
    <div className="flex-1 text-2xl text-center text-blue-600">
      {Math.floor(timeLeft / 3600)}:
      {Math.floor((timeLeft % 3600) / 60) < 10 ? `0${Math.floor((timeLeft % 3600) / 60)}` : Math.floor((timeLeft % 3600) / 60)}:
      {timeLeft % 60 < 10 ? `0${timeLeft % 60}` : timeLeft % 60}
    </div>
  );
}

export default Timer;
