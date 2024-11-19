// src/App.js
import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import StudentDashboard from './components/StudentDashboard';
import TeacherDashboard from './components/TeacherDashboard';
import StudentProfile from './components/StudentProfile';
import ViewProfile from './components/ViewProfile';
import TimeTable from './components/TimeTable';
import ProtectedRoute from './components/ProtectedRoute';
import './index.css';

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route 
        path="/student-dashboard" 
        element={
          <ProtectedRoute>
            <StudentDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/teacher-dashboard" 
        element={
          <ProtectedRoute>
            <TeacherDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/student-profile" 
        element={
          <ProtectedRoute>
            <StudentProfile />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/view-profile" 
        element={
          <ProtectedRoute>
            <ViewProfile />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/timetable" 
        element={
          <ProtectedRoute>
            <TimeTable />
          </ProtectedRoute>
        } 
      />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
};

export default App;
