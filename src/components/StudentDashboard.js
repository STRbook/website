// src/components/StudentDashboard.js

import React, { useState } from 'react';
import Header from './Header';
import Footer from './Footer';
import './styles/Dashboard.css';

const semesters = [
  'Semester 1',
  'Semester 2',
  'Semester 3',
  'Semester 4',
  'Semester 5',
  'Semester 6',
  'Semester 7',
  'Semester 8'
];

const handleFileChange = (file) => {
  // upload
  console.log("Selected file:", file);
};



const StudentDashboard = () => {

  const [moocCertificates, setMoocCertificates] = useState([
    {
      semester: 'Semester 1',
      platform: 'Udemy',
      title: 'Python Basics',
      startDate: '01-05-2023',
      endDate: '25-05-2023',
      hoursPerWeek: '3'
    },
    {
      semester: 'Semester 2',
      platform: 'Coursera',
      title: 'C/C++',
      startDate: '03-09-2023',
      endDate: '30-09-2023',
      hoursPerWeek: '3'
    }
  ]);



  const [formData, setFormData] = useState({
    semester: '',
    platform: '',
    title: '',
    startDate: '',
    endDate: '',
    hoursPerWeek: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newMoocCertificate = { ...formData };
    setMoocCertificates([...moocCertificates, newMoocCertificate]);
    setFormData({
      semester: '',
      platform: '',
      title: '',
      startDate: '',
      endDate: '',
      hoursPerWeek: ''
    });
  };

  return (
    <div className="dashboard-container">
      <Header userType="student" />
      <main className="dashboard-content">
        <h2>Welcome, Student</h2>

        <h3>Add MOOC Certificate</h3>
        <form className="add-mooc-form" onSubmit={handleSubmit}>
          <label>
            Semester:
            <select name="semester" value={formData.semester} onChange={handleChange}>
              {semesters.map((semester, index) => (
                <option key={index} value={semester}>{semester}</option>
              ))}
            </select>
          </label>
          <label>
            Platform:
            <select name="platform" value={formData.platform} onChange={handleChange}>
              <option value="udemy">Udemy</option>
              <option value="coursera">Coursera</option>
              <option value="other">Other</option>
            </select>
          </label>
          <label>
            MOOC Title:
            <input type="text" name="title" value={formData.title} onChange={handleChange} />
          </label>
          <label>
            Start Date:
            <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} />
          </label>
          <label>
            Completed Date:
            <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} />
          </label>
          <label>
            Hours Per Week:
            <input type="text" name="hoursPerWeek" value={formData.hoursPerWeek} onChange={handleChange} />
          </label>
          <div>
        <label htmlFor="certificate">Upload Certificate (PDF, JPEG, JPG, PNG):</label>
        <input 
          type="file" 
          id="certificate" 
          name="certificate" 
          accept=".pdf,.jpeg,.jpg,.png" 
          onChange={(e) => handleFileChange(e.target.files[0])} 
        />
      </div>
          <div className="form-actions">
            <button type="submit">Add Certificate</button>
          </div>
        </form>
        <h3>Previous MOOC Certificates</h3>
        <table className="mooc-certificates-table">
          <thead>
            <tr>
              <th>Semester</th>
              <th>Platform</th>
              <th>MOOC Title</th>
              <th>Start Date</th>
              <th>Completed Date</th>
              <th>Hours Per Week</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
            {moocCertificates.map((certificate, index) => (
              <tr key={index}>
                <td>{certificate.semester}</td>
                <td>{certificate.platform}</td>
                <td>{certificate.title}</td>
                <td>{certificate.startDate}</td>
                <td>{certificate.endDate}</td>
                <td>{certificate.hoursPerWeek}</td>
                <td></td> {/* teacher score */}
              </tr>
            ))}
          </tbody>
        </table>
      </main>
      <Footer />
    </div>
  );
};

export default StudentDashboard;
