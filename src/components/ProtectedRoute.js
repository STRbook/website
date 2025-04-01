import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom'; 
import axios from 'axios'; 
import { API_ENDPOINTS } from '../config/api'; 

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const storedUser = localStorage.getItem('user');
  const location = useLocation(); 

  const [user, setUser] = useState(null);
  const [isStudentFirstLogin, setIsStudentFirstLogin] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null); 

  useEffect(() => {
    let isMounted = true; 

    const verifyUser = async () => {
      setLoading(true);
      setAuthError(null);

      if (!token || !storedUser) {
        if (isMounted) setLoading(false);
        return; 
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
        
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        return;
      }

      
      if (parsedUser.role === 'teacher') {
        if (isMounted) setLoading(false);
        return; 
      }

      
      if (parsedUser.role === 'student') {
        
        if (typeof parsedUser.is_first_login === 'boolean') {
           if (isMounted) {
              setIsStudentFirstLogin(parsedUser.is_first_login);
              setLoading(false);
           }
           return;
        }
        
        
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
        
         if (isMounted) {
            setAuthError(`Unknown user role: ${parsedUser.role}`);
            setLoading(false);
         }
      }
    };

    verifyUser();

    return () => {
      isMounted = false; 
    };

  }, [token, storedUser]); 



  if (loading) {
    
    return <div>Loading...</div>; 
  }

  if (!token || !user || authError) {
    
    console.error("Authentication check failed or error occurred:", authError);
    
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  

  if (user.role === 'teacher') {
    
    return children;
  }

  if (user.role === 'student') {
    if (isStudentFirstLogin === true) {
      
      if (location.pathname === '/student-profile') {
        return children; 
      } else {
        
        return <Navigate to="/student-profile" replace />;
      }
    } else if (isStudentFirstLogin === false) {
      
      
      return children;
    } else {
       
       console.error("Student first login status undetermined, redirecting to login.");
       return <Navigate to="/login" state={{ from: location }} replace />;
    }
  }

  
  console.error("Unknown user role detected in render logic, redirecting to login.");
  return <Navigate to="/login" state={{ from: location }} replace />;
};

export default ProtectedRoute;
