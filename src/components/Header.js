import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './styles/Header.css';
import logo from '../assets/logo.png';

const Header = ({ userType }) => {
  const navigate = useNavigate();
  const [studentName, setStudentName] = useState('');

  useEffect(() => {
    const fetchStudentName = async () => {
      try {
        const student_id = localStorage.getItem('student_id');
        const token = localStorage.getItem('token');

        if (!student_id || !token) return;

        const response = await fetch(`http://localhost:5000/api/student-profile/${student_id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.first_name && data.last_name) {
            setStudentName(`${data.first_name} ${data.last_name}`);
          }
        }
      } catch (error) {
        console.error('Error fetching student name:', error);
      }
    };

    if (userType === 'student') {
      fetchStudentName();
    }
  }, [userType]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('student_id');
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          <Link to="/">
            <img src={logo} alt="Logo" />
          </Link>
        </div>
        <nav className="nav-links">
          {userType === 'student' && (
            <>
              <Link to="/timetable">Timetable</Link>
              <Link to="/view-profile">Profile</Link>
              <Link to="/student-dashboard">Dashboard</Link>
              <span className="student-name">{studentName}</span>
            </>
          )}
          {userType === 'teacher' && (
            <>
              <Link to="/teacher-dashboard">Dashboard</Link>
            </>
          )}
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
