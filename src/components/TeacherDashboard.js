import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import Header from './Header';
import Footer from './Footer';
import { API_ENDPOINTS } from '../config/api'; 
import './styles/Dashboard.css'; 

const TeacherDashboard = () => {
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); 

  useEffect(() => {
    document.title = "Teacher Dashboard";
    fetchStudents();
  }, []); 

  const fetchStudents = async () => {
    setIsLoading(true);
    setError(null);
    const token = localStorage.getItem('token'); 

    if (!token) {
      setError('Authentication token not found. Please log in.');
      setIsLoading(false);
      
      
      return;
    }

    try {
      const response = await fetch(API_ENDPOINTS.TEACHER_STUDENTS, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`, 
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setStudents(data);
    } catch (err) {
      console.error("Failed to fetch students:", err);
      setError(err.message || 'Failed to fetch student data.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewProfile = (studentId) => {
    
    navigate(`/teacher/view-student/${studentId}`); 
  };

  return (
    <div className="dashboard-container">
      <Header /> 
      <main className="dashboard-content">
        <h2>Teacher Dashboard</h2>
        <p>View student records.</p>

        

        {isLoading && <p>Loading students...</p>}
        {error && <p className="error-message">Error: {error}</p>}

        {!isLoading && !error && (
          <table className="students-table"> 
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Name</th>
                <th>USN</th>
                <th>Email</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.length > 0 ? (
                students.map((student) => (
                  <tr key={student.student_id}>
                    <td>{student.student_id}</td>
                    
                    <td>{`${student.first_name || ''} ${student.last_name || ''}`.trim() || 'N/A'}</td>
                    <td>{student.usn || 'N/A'}</td>
                    <td>{student.email}</td>
                    <td>
                      <button onClick={() => handleViewProfile(student.student_id)}>
                        View Profile
                      </button>
                      
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5">No students found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default TeacherDashboard;
