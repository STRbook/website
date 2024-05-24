import React from 'react';
import './styles/Header.css';
import logo from '../assets/logo.png'; //

const Header = ({ userType }) => {
  return (
    <header className="header">
      <div className="logo-container">
        <img src={logo} alt="Logo" className="logo" />
      <h1>Mooc Management</h1>
      </div>
      <nav>
        <ul>
          {userType === 'teacher' && <li><a href="/teacher-dashboard">TeacherName</a></li>}
          {userType === 'student' && <li><a href="/student-dashboard">StudentName</a></li>}
          <li><a href="/logout">Logout</a></li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
