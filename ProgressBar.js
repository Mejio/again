import React from 'react';

function ProgressBar({ label, progress }) {
  return (
    <div>
      <p>{label}: {progress}%</p>
      <div className="progress-bar">
        <div style={{ width: `${progress}%` }}></div>
      </div>
    </div>
  );
}

export default ProgressBar;
