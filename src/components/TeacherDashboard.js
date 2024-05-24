// src/components/TeacherDashboard.js

import React from 'react';
import Header from './Header';
import Footer from './Footer';
import './styles/Dashboard.css';

const TeacherDashboard = () => {
  return (
    <div className="dashboard-container">
      <Header userType="teacher" />
      <main className="dashboard-content">
        <h2>Welcome, Teacher</h2>
        <p>View and manage students' MOOC completion certificates.</p>
        {/* WIP */}
      </main>
      <Footer />
    </div>
  );
};

export default TeacherDashboard;
