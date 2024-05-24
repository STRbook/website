import React, { useState } from 'react';
import Header from './Header';
import Footer from './Footer';
import './styles/Dashboard.css';

const TeacherDashboard = () => {
  const [selectedClass, setSelectedClass] = useState(null);
  const [students, setStudents] = useState([]);

  // sample
  const sampleStudentsData = [
    {
      id: 1,
      name: "sajal",
      platform: "Udemy",
      moocTitle: "Python Basics",
      startDate: "01-05-2023",
      completedDate: "25-05-2023",
      hoursPerWeek: 3
    },
    {
      id: 2,
      name: "Saj",
      platform: "Coursera",
      moocTitle: "C/C++",
      startDate: "03-09-2023",
      completedDate: "30-09-2023",
      hoursPerWeek: 3
    },

  ];


  const fetchStudents = (selectedClass) => {

    setStudents(sampleStudentsData);
  };


  const handleClassSelect = (e) => {
    const selectedClass = e.target.value;
    setSelectedClass(selectedClass);
    fetchStudents(selectedClass);
  };


  const viewCertificate = (studentId) => {

    console.log(`View certificate for student with id: ${studentId}`);
  };

  return (
    <div className="dashboard-container">
      <Header userType="teacher" />
      <main className="dashboard-content">
        <h2>Welcome, Teacher</h2>
        <p>View and manage students' MOOC completion certificates.</p>

        <select onChange={handleClassSelect} value={selectedClass}>
          <option value="">Select Class</option>

          <option value="class1">Class 1</option>
          <option value="class2">Class 2</option>

        </select>


        <table className="mooc-certificates-table">
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Platform</th>
              <th>MOOC Title</th>
              <th>Start Date</th>
              <th>Completed Date</th>
              <th>Hours Per Week</th>
              <th>Action</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student, index) => (
              <tr key={index}>
                <td>{student.name}</td>
                <td>{student.platform}</td>
                <td>{student.moocTitle}</td>
                <td>{student.startDate}</td>
                <td>{student.completedDate}</td>
                <td>{student.hoursPerWeek}</td>
                <td>

                  <button onClick={() => viewCertificate(student.id)}>View Certificate</button>
                </td>
                <td>

                  <select>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
      <Footer />
    </div>
  );
};

export default TeacherDashboard;
