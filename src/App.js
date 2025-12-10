import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Header from './components/Header';
import NotificationSystem from './components/NotificationSystem';
import './styles/colors.css';
import './styles/bookmyshow.css';

import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import WorkerDetails from './pages/WorkerDetails';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Favorites from './pages/Favorites';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', color: '#333333' }}>
          <Header />
          <NotificationSystem />

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/worker/:id" element={<WorkerDetails />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/bookings" element={<Navigate to="/dashboard" replace />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/favorites" element={<Favorites />} />
          </Routes>
        </div>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;