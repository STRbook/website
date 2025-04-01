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
import Announcements from './components/Announcements'; 
import VTUCalculator from './components/VTUCalculator';
import TeacherViewStudentProfile from './components/TeacherViewStudentProfile'; 
import ProtectedRoute from './components/ProtectedRoute'; 

import './App.css';
import './index.css';


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
      <Route path="/announcements" element={<ProtectedRoute><Announcements /></ProtectedRoute>} /> 
      <Route path="/cgpa-calculator" element={<ProtectedRoute><VTUCalculator /></ProtectedRoute>} />
      
      <Route path="/teacher/view-student/:studentId" element={<ProtectedRoute><TeacherViewStudentProfile /></ProtectedRoute>} /> 
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default App;
