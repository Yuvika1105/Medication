import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import Medications from '@/pages/Medications';
import DailyTracker from '@/pages/DailyTracker';
import DoctorCommunication from '@/pages/DoctorCommunication';
import Profile from '@/pages/Profile';
import Navigation from '@/components/Navigation';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || 'null'));

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  const handleLogin = (newToken, userData) => {
    setToken(newToken);
    setUser(userData);
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  if (!token) {
    return (
      <div className="grain-overlay">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login onLogin={handleLogin} />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </BrowserRouter>
        <Toaster position="top-center" richColors />
      </div>
    );
  }

  return (
    <div className="grain-overlay">
      <BrowserRouter>
        <div className="min-h-screen pb-24 md:pb-0">
          <Navigation user={user} onLogout={handleLogout} />
          <Routes>
            <Route path="/" element={<Dashboard token={token} user={user} />} />
            <Route path="/medications" element={<Medications token={token} />} />
            <Route path="/tracker" element={<DailyTracker token={token} />} />
            <Route path="/doctor" element={<DoctorCommunication token={token} />} />
            <Route path="/profile" element={<Profile token={token} onLogout={handleLogout} />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </BrowserRouter>
      <Toaster position="top-center" richColors />
    </div>
  );
}

export default App;