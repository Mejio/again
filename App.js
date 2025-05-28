import React, { useState, useEffect } from 'react';
import './App.css';
import ProgressBar from './components/ProgressBar';
import StudyTimer from './components/StudyTimer';
import StudyMaterials from './components/StudyMaterials';
import Schedule from './components/Schedule';

function App() {
  const [timer, setTimer] = useState(25 * 60);  // 25-minute Pomodoro timer
  const [studyProgress] = useState({
    webDev: 75,
    dataStructures: 45,
  });
  const [recentAchievements] = useState({
    quickLearner: 'Completed 3 lessons in one day',
    focusMaster: '2 hours of focused study time',
  });

  const startTimer = () => {
    let timerInterval = setInterval(() => {
      setTimer(prevTime => {
        if (prevTime <= 0) {
          clearInterval(timerInterval);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    // Optional: Fetch study progress or user data from the backend
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Welcome back, Ashley</h1>
        <p className="quote">"Success is not final, failure is not fatal: It is the courage to continue that counts."</p>
      </header>

      <div className="dashboard">
        <div className="study-progress">
          <h2>Continue Learning</h2>
          <ProgressBar label="Web Development" progress={studyProgress.webDev} />
          <ProgressBar label="Data Structures" progress={studyProgress.dataStructures} />
        </div>

        <div className="focus-tools">
          <h2>Focus Tools</h2>
          <StudyTimer time={timer} startTimer={startTimer} />
          <p>Study Tip: Take regular breaks using the Pomodoro Technique.</p>
        </div>
      </div>

      <div className="study-materials">
        <StudyMaterials />
      </div>

      <div className="schedule">
        <Schedule />
      </div>

      <div className="achievements">
        <h3>Recent Achievements</h3>
        <p>Quick Learner: {recentAchievements.quickLearner}</p>
        <p>Focus Master: {recentAchievements.focusMaster}</p>
      </div>
    </div>
  );
}

export default App;
