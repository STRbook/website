// src/components/StudentProjects.js

import React, { useState, useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import './styles/StudentProjects.css';

const semesters = [
  'Semester 1', 'Semester 2', 'Semester 3', 'Semester 4',
  'Semester 5', 'Semester 6', 'Semester 7', 'Semester 8'
];

const StudentProjects = () => {
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState([
    {
      title: "E-Commerce Platform",
      startDate: "2023-08-01",
      completedDate: "2023-12-15",
      manHours: 120,
      description: "Built a full-stack e-commerce platform using MERN stack with features like user authentication, product management, and payment integration.",
      semester: "Semester 7"
    },
    {
      title: "Machine Learning Image Classifier",
      startDate: "2023-01-15",
      completedDate: "2023-05-20",
      manHours: 80,
      description: "Developed an ML model using TensorFlow to classify different types of plant diseases from leaf images with 92% accuracy.",
      semester: "Semester 6"
    },
    {
      title: "Smart Home Automation",
      startDate: "2022-08-10",
      completedDate: "2022-12-01",
      manHours: 100,
      description: "Created an IoT-based home automation system using Arduino and Raspberry Pi for controlling lights, temperature, and security cameras.",
      semester: "Semester 5"
    }
  ]);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    manHours: '',
    startDate: '',
    completedDate: '',
    semester: 'Semester 1',
    description: ''
  });

  useEffect(() => {
    document.title = "Student Projects";
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const studentId = localStorage.getItem('student_id');
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/projects/${studentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          setProjects([]);
          return;
        }
        throw new Error('Failed to fetch projects');
      }

      const data = await response.json();
      setProjects(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const studentId = localStorage.getItem('student_id');

      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          studentId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to add project');
      }

      await fetchProjects();
      
      // Reset form
      setFormData({
        title: '',
        manHours: '',
        startDate: '',
        completedDate: '',
        semester: 'Semester 1',
        description: ''
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="student-projects">
      <Header userType="student" />
      <div className="container py-4">
        <h2 className="text-center mb-4">Student Projects</h2>
        
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <div className="project-form">
          <h3 className="mb-3">Add New Project</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="title">Project Title</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label htmlFor="manHours">Man Hours</label>
                <input
                  type="number"
                  id="manHours"
                  name="manHours"
                  value={formData.manHours}
                  onChange={handleInputChange}
                  required
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label htmlFor="startDate">Start Date</label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  required
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label htmlFor="completedDate">Completion Date</label>
                <input
                  type="date"
                  id="completedDate"
                  name="completedDate"
                  value={formData.completedDate}
                  onChange={handleInputChange}
                  required
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label htmlFor="semester">Semester</label>
                <select
                  id="semester"
                  name="semester"
                  value={formData.semester}
                  onChange={handleInputChange}
                  required
                  className="form-control"
                >
                  {semesters.map(sem => (
                    <option key={sem} value={sem}>{sem}</option>
                  ))}
                </select>
              </div>

              <div className="form-group full-width">
                <label htmlFor="description">Project Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  className="form-control"
                  rows="4"
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Adding...' : 'Add Project'}
            </button>
          </form>
        </div>

        {loading ? (
          <div className="text-center my-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <div className="projects-list">
            <h3 className="section-title">Your Projects</h3>
            {projects.length === 0 ? (
              <p className="no-projects">No projects added yet.</p>
            ) : (
              ["Semester 7", "Semester 6", "Semester 5"].map(semester => {
                const semesterProjects = projects.filter(proj => proj.semester === semester);
                if (semesterProjects.length === 0) return null;
                
                return (
                  <div key={semester} className="semester-section">
                    <h4 className="semester-title">{semester}</h4>
                    <div className="table-responsive">
                      <table className="projects-table">
                        <thead>
                          <tr>
                            <th>Project Title</th>
                            <th>Start Date</th>
                            <th>Completion Date</th>
                            <th>Man Hours</th>
                            <th>Description</th>
                          </tr>
                        </thead>
                        <tbody>
                          {semesterProjects.map((project, index) => (
                            <tr key={index}>
                              <td>{project.title}</td>
                              <td>{new Date(project.startDate).toLocaleDateString()}</td>
                              <td>{new Date(project.completedDate).toLocaleDateString()}</td>
                              <td>{project.manHours}</td>
                              <td>{project.description}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default StudentProjects;
