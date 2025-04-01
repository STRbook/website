import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './styles/Header.css';
import logo from '../assets/logo.png';

const Header = () => { // Remove userType prop
  const navigate = useNavigate();
  const [user, setUser] = useState(null); // State to hold user object

  useEffect(() => {
    // Read user info from localStorage on component mount
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse user data from localStorage", error);
        // Clear potentially corrupted data and redirect to login
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        navigate('/login');
      }
    } else {
      // If no user data, ensure token is also cleared and potentially redirect
      const token = localStorage.getItem('token');
      if (token) {
         // If there's a token but no user data, something is inconsistent
         localStorage.removeItem('token'); 
      }
      // Optional: redirect to login if no user data found in a protected area
      // navigate('/login'); 
    }
  }, [navigate]); // Add navigate to dependency array

  const handleLogout = () => {
    // Clear user data and token, then navigate to login
    localStorage.removeItem('token');
    localStorage.removeItem('user'); 
    setUser(null); // Clear user state
    navigate('/login');
  };

  // Determine display name
  const displayName = user 
    ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email // Fallback to email if name is missing
    : 'Profile';

  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          <Link to="/">
            <img src={logo} alt="Logo" />
          </Link>
        </div>
        <nav className="nav-links">
          {/* Render links based on user role */}
          {user?.role === 'student' && (
            <>
              <Link to="/timetable">Timetable</Link>
              <Link to="/mooc">Mooc</Link>
              <Link to="/projects">Projects</Link>
              <Link to="/events">Events</Link>
              <Link to="/cgpa-calculator">SGPA Calculator</Link>
              {/* Link to student's own profile view */}
              <Link to="/view-profile" className="user-name"> 
                {displayName}
              </Link>
            </>
          )}
          {user?.role === 'teacher' && (
            <>
              <Link to="/teacher-dashboard">Dashboard</Link>
              {/* Maybe add a profile link for teachers later */}
               <span className="user-name">{displayName}</span> 
            </>
          )}
          {/* Show logout button only if user is logged in */}
          {user && (
             <button onClick={handleLogout} className="logout-btn">Logout</button>
          )}
          {/* Optionally show Login/Register if no user */}
          {!user && (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
