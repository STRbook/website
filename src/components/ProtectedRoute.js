import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
// Removed unused imports: axios, API_ENDPOINTS, useState, useEffect

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const storedUser = localStorage.getItem('user');
  const location = useLocation();

  // No need for loading state or useEffect for API calls anymore

  if (!token || !storedUser) {
    // If no token or user data, redirect to login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  let user;
  try {
    user = JSON.parse(storedUser);
  } catch (error) {
    console.error("Failed to parse user data from localStorage:", error);
    // Clear potentially corrupted data and redirect
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Basic validation of parsed user object
  if (!user || typeof user !== 'object' || !user.role || !user.id) {
     console.error("Invalid user data structure in localStorage:", user);
     localStorage.removeItem('user');
     localStorage.removeItem('token');
     return <Navigate to="/login" state={{ from: location }} replace />;
  }


  // --- Role-based Access Logic ---

  if (user.role === 'teacher') {
    // Teachers have access to all protected routes
    return children;
  }

  if (user.role === 'student') {
    // Check student's first login status directly from the parsed user object
    if (typeof user.is_first_login !== 'boolean') {
        console.error("Student 'is_first_login' flag missing or invalid in localStorage:", user);
        // Redirect to login if status is unclear
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (user.is_first_login === true) {
      // If it's the first login, only allow access to the student profile page
      if (location.pathname === '/student-profile') {
        return children; // Allow access to the profile page
      } else {
        // Redirect any other route attempts to the profile page
        return <Navigate to="/student-profile" replace />;
      }
    } else {
      // If not first login (is_first_login is false), allow access to the requested child route
      return children;
    }
  }

  // --- Fallback for Unknown Roles ---
  console.error(`Unknown user role detected ('${user.role}'), redirecting to login.`);
  return <Navigate to="/login" state={{ from: location }} replace />;
};

export default ProtectedRoute;
