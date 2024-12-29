// src/App.js
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import TeacherDashboard from './components/TeacherDashboard';
import StudentProfile from './components/StudentProfile';
import ViewProfile from './components/ViewProfile';
import TimeTable from './components/TimeTable';
import StudentMooc from './components/StudentMooc';
import StudentProjects from './components/StudentProjects';
import Events from './components/Events';
import VTUCalculator from './components/VTUCalculator';

import './App.css';
import './index.css';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/mooc" element={<ProtectedRoute><StudentMooc /></ProtectedRoute>} />
      <Route path="/projects" element={<ProtectedRoute><StudentProjects /></ProtectedRoute>} />
      <Route path="/teacher-dashboard" element={<ProtectedRoute><TeacherDashboard /></ProtectedRoute>} />
      <Route path="/student-profile" element={<ProtectedRoute><StudentProfile /></ProtectedRoute>} />
      <Route path="/view-profile" element={<ProtectedRoute><ViewProfile /></ProtectedRoute>} />
      <Route path="/timetable" element={<ProtectedRoute><TimeTable /></ProtectedRoute>} />
      <Route path="/events" element={<ProtectedRoute><Events /></ProtectedRoute>} />
      <Route path="/cgpa-calculator" element={<ProtectedRoute><VTUCalculator /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default App;
