// src/App.jsx
import { Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage.jsx';
import Login from './components/Login.jsx';
import Signup from './components/Signup.jsx';
import AuthButtons from './components/AuthButtons.jsx';

function App() {
  return (
    <>
      <AuthButtons />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </>
  );
}

export default App;

