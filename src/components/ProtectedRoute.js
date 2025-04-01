import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom'; // Import useLocation
import axios from 'axios'; // Assuming axios is used for API calls
import { API_ENDPOINTS } from '../config/api'; // Import API endpoints for student profile check

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const storedUser = localStorage.getItem('user');
  const location = useLocation(); // Get current location

  const [user, setUser] = useState(null);
  const [isStudentFirstLogin, setIsStudentFirstLogin] = useState(null); // null, true, false
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null); // Use a different name to avoid conflict

  useEffect(() => {
    let isMounted = true; // Flag to prevent state updates on unmounted component

    const verifyUser = async () => {
      setLoading(true);
      setAuthError(null);

      if (!token || !storedUser) {
        if (isMounted) setLoading(false);
        return; // Not authenticated
      }

      let parsedUser;
      try {
        parsedUser = JSON.parse(storedUser);
        if (isMounted) setUser(parsedUser);
      } catch (error) {
        console.error("Failed to parse user data:", error);
        if (isMounted) {
          setAuthError("Invalid user data stored.");
          setLoading(false);
        }
        // Clear corrupted data
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        return;
      }

      // If user is a teacher, authentication is sufficient (backend handles authorization)
      if (parsedUser.role === 'teacher') {
        if (isMounted) setLoading(false);
        return; 
      }

      // If user is a student, check their first login status
      if (parsedUser.role === 'student') {
        // Check if is_first_login is already in the stored user object
        if (typeof parsedUser.is_first_login === 'boolean') {
           if (isMounted) {
              setIsStudentFirstLogin(parsedUser.is_first_login);
              setLoading(false);
           }
           return;
        }
        
        // If not in stored object, fetch from profile (legacy check)
        try {
          const response = await axios.get(`${API_ENDPOINTS.STUDENT_PROFILE}/${parsedUser.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (isMounted) {
            setIsStudentFirstLogin(response.data.is_first_login);
          }
        } catch (err) {
          console.error('Error fetching student profile status:', err);
          if (isMounted) {
            setAuthError(err.response?.data?.message || err.message || 'Failed to verify student status');
          }
        } finally {
          if (isMounted) setLoading(false);
        }
      } else {
        // Unknown role
         if (isMounted) {
            setAuthError(`Unknown user role: ${parsedUser.role}`);
            setLoading(false);
         }
      }
    };

    verifyUser();

    return () => {
      isMounted = false; // Cleanup function to set flag false when component unmounts
    };

  }, [token, storedUser]); // Re-run if token or storedUser changes

  // --- Render Logic ---

  if (loading) {
    // Show loading indicator while verifying authentication and status
    return <div>Loading...</div>; 
  }

  if (!token || !user || authError) {
    // If no token, no user, or an error occurred during verification, redirect to login
    console.error("Authentication check failed or error occurred:", authError);
    // Preserve the intended destination path in state for redirection after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // --- Role-Specific Logic ---

  if (user.role === 'teacher') {
    // Teachers are allowed access to any protected route (backend handles fine-grained authorization)
    return children;
  }

  if (user.role === 'student') {
    if (isStudentFirstLogin === true) {
      // Student's first login: ONLY allow access to '/student-profile'
      if (location.pathname === '/student-profile') {
        return children; // Allow access if already on the profile page
      } else {
        // Redirect any other route attempt to the profile page
        return <Navigate to="/student-profile" replace />;
      }
    } else if (isStudentFirstLogin === false) {
      // Student has completed first login: allow access to the requested route
      // (Optional: could add logic here to prevent access to '/student-profile' again if desired)
      return children;
    } else {
       // isStudentFirstLogin is still null (shouldn't happen if loading/error handled correctly, but acts as fallback)
       console.error("Student first login status undetermined, redirecting to login.");
       return <Navigate to="/login" state={{ from: location }} replace />;
    }
  }

  // Fallback for unknown role (should be caught by authError earlier, but for safety)
  console.error("Unknown user role detected in render logic, redirecting to login.");
  return <Navigate to="/login" state={{ from: location }} replace />;
};

export default ProtectedRoute;
