import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios'; // Assuming axios is used for API calls

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const studentId = localStorage.getItem('student_id');
  const [isFirstLogin, setIsFirstLogin] = useState(null); // null initially, true/false after fetch
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkProfileStatus = async () => {
      if (!token || !studentId) {
        setLoading(false);
        return; // No need to fetch if not logged in
      }

      try {
        setLoading(true);
        setError(null);
        // Rely on the proxy setting in package.json
        const response = await axios.get(`/api/student-profile/${studentId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Check the structure of your API response and access is_first_login accordingly
        // Based on the backend code, it should be directly on the response.data
        setIsFirstLogin(response.data.is_first_login); 
      } catch (err) {
        console.error('Error fetching profile status:', err);
        setError(err.response?.data?.message || err.message || 'Failed to fetch profile status');
        // Don't try to interpret the error as a specific isFirstLogin state.
        // Any error means we couldn't reliably determine the status.
      } finally {
        setLoading(false);
      }
    };

    checkProfileStatus();
  }, [token, studentId]); // Re-run if token or studentId changes

  if (!token || !studentId) {
    // Redirect to login if token/studentId is missing (already handled in effect, but good safety check)
    return <Navigate to="/login" />;
  }

  if (loading) {
    // Optional: Show a loading indicator while checking profile status
    return <div>Loading...</div>; 
  }
  
  if (error) {
     // If profile status couldn't be fetched, redirect to login for safety.
     console.error("Redirecting to login due to profile fetch error:", error);
     // Optionally display a message to the user before redirecting
     // return <div>Error verifying your profile status. Please log in again.</div>;
     return <Navigate to="/login" />;
  }

  // Only proceed if loading is complete AND there was no error
  if (isFirstLogin === true) {
    // If it's the first login, redirect to the profile page
    // Allow access *only* to the profile page itself if isFirstLogin is true
    if (window.location.pathname.includes('/student-profile')) {
       return children; // Allow access if already on the profile page
    }
    return <Navigate to="/student-profile" />;
  }

  if (isFirstLogin === false) {
    // If it's not the first login, allow access to the requested route
    // Prevent access to the profile page if it's not the first login? Optional.
    // if (window.location.pathname.includes('/student-profile')) {
    //    return <Navigate to="/timetable" />; // Or dashboard, etc.
    // }
    return children;
  }

  // Fallback case (e.g., isFirstLogin is still null, though should be handled by loading/error states)
  return <Navigate to="/login" />; 
};

export default ProtectedRoute;
