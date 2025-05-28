import React from 'react';

function StudyTimer({ time, startTimer }) {
  return (
    <div>
      <p>Time Remaining: {Math.floor(time / 60)}:{time % 60 < 10 ? '0' : ''}{time % 60}</p>
      <button onClick={startTimer}>Start Timer</button>
    </div>
  );
}

export default StudyTimer;