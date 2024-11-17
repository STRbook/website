import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const studentId = localStorage.getItem('studentId');

  if (!token || !studentId) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default ProtectedRoute;
