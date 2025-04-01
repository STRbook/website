import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './styles/Header.css';
import logo from '../assets/logo.png';

const Header = () => { 
  const navigate = useNavigate();
  const [user, setUser] = useState(null); 

  useEffect(() => {
    
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse user data from localStorage", error);
        
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        navigate('/login');
      }
    } else {
      
      const token = localStorage.getItem('token');
      if (token) {
         
         localStorage.removeItem('token'); 
      }
      
      
    }
  }, [navigate]); 

  const handleLogout = () => {
    
    localStorage.removeItem('token');
    localStorage.removeItem('user'); 
    setUser(null); 
    navigate('/login');
  };

  
  const displayName = user 
    ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email 
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
          
          {user?.role === 'student' && (
            <>
              <Link to="/timetable">Timetable</Link>
              <Link to="/mooc">Mooc</Link>
              <Link to="/projects">Projects</Link>
              <Link to="/events">Events</Link>
              <Link to="/cgpa-calculator">SGPA Calculator</Link>
              
              <Link to="/view-profile" className="user-name"> 
                {displayName}
              </Link>
            </>
          )}
          {user?.role === 'teacher' && (
            <>
              <Link to="/teacher-dashboard">Dashboard</Link>
              
               <span className="user-name">{displayName}</span> 
            </>
          )}
          
          {user && (
             <button onClick={handleLogout} className="logout-btn">Logout</button>
          )}
          
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
