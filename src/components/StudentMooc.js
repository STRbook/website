// src/components/StudentMooc.js

import React, { useState, useEffect } from 'react';
import { storage } from '../firebase/config';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import Header from './Header';
import Footer from './Footer';
import './styles/StudentMooc.css';

const semesters = [
  'Semester 1', 'Semester 2', 'Semester 3', 'Semester 4',
  'Semester 5', 'Semester 6', 'Semester 7', 'Semester 8'
];

const StudentMooc = () => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    semester: 'Semester 1',
    platform: '',
    title: '',
    startDate: '',
    endDate: '',
    hoursPerWeek: '',
    certificateUrl: ''
  });

  useEffect(() => {
    document.title = "MOOC Certificates";
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      const token = localStorage.getItem('token');
      const studentId = localStorage.getItem('student_id');
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/mooc-certificates/${studentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          setCertificates([]);
          return;
        }
        throw new Error('Failed to fetch certificates');
      }
      
      const data = await response.json();
      setCertificates(data);
    } catch (err) {
      console.error(err);
      // Don't set error state for empty certificates
      setCertificates([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileUpload = async (file) => {
    if (!file) return;
    
    // Check file size (4MB limit)
    const maxSize = 4 * 1024 * 1024; // 4MB in bytes
    if (file.size > maxSize) {
      setError('File size exceeds 4MB limit');
      return;
    }

    // Check file type
    if (file.type !== 'application/pdf') {
      setError('Only PDF files are allowed');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Create a reference to the file in Firebase Storage
      const studentId = localStorage.getItem('student_id');
      const fileName = `${studentId}_${Date.now()}_${file.name}`;
      const storageRef = ref(storage, `mooc_certificates/${fileName}`);
      
      // Start upload
      const uploadTask = uploadBytesResumable(storageRef, file);
      
      uploadTask.on('state_changed',
        (snapshot) => {
          // Track upload progress
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          setError('Failed to upload file');
          setLoading(false);
          console.error(error);
        },
        async () => {
          // Upload completed successfully
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          setFormData(prev => ({
            ...prev,
            certificateUrl: downloadURL
          }));
          setLoading(false);
          setUploadProgress(0);
        }
      );
    } catch (err) {
      setError('Failed to upload file');
      setLoading(false);
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const studentId = localStorage.getItem('student_id');
      
      // Format data to match schema requirements
      const requestData = {
        ...formData,
        student_id: studentId,
        hours_per_week: parseInt(formData.hoursPerWeek, 10), // Ensure integer
        start_date: formData.startDate, // Already in YYYY-MM-DD format from input[type="date"]
        end_date: formData.endDate,
        certificate_url: formData.certificateUrl
      };
      
      console.log('Sending data to server:', requestData);
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/mooc-certificates`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save certificate');
      }
      
      // Refresh certificates list
      await fetchCertificates();
      
      // Reset form
      setFormData({
        semester: 'Semester 1',
        platform: '',
        title: '',
        startDate: '',
        endDate: '',
        hoursPerWeek: '',
        certificateUrl: ''
      });
      
    } catch (err) {
      setError('Failed to save certificate');
      console.error(err);
    }
  };

  return (
    <div className="dashboard-container">
      <Header userType="student" />
      <div className="dashboard-content">
        <h2 className="section-title">MOOC Certificates</h2>
        <p className="form-subtitle">Add and manage your online course certificates</p>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="certificate-form">
          <div className="form-grid">
            <div className="form-group">
              <label>Semester:</label>
              <select
                name="semester"
                value={formData.semester}
                onChange={handleInputChange}
                required
              >
                {semesters.map(sem => (
                  <option key={sem} value={sem}>{sem}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>Platform:</label>
              <input
                type="text"
                name="platform"
                value={formData.platform}
                onChange={handleInputChange}
                required
                placeholder="e.g., Coursera, Udemy"
              />
            </div>
            
            <div className="form-group">
              <label>Course Title:</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                placeholder="Course title"
              />
            </div>
            
            <div className="form-group">
              <label>Hours per Week:</label>
              <input
                type="number"
                name="hoursPerWeek"
                value={formData.hoursPerWeek}
                onChange={handleInputChange}
                required
                min="1"
                placeholder="Hours spent per week"
              />
            </div>
            
            <div className="form-group">
              <label>Start Date:</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label>End Date:</label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group full-width">
              <label>Certificate (PDF):</label>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => handleFileUpload(e.target.files[0])}
                required={!formData.certificateUrl}
              />
              {loading && (
                <div className="progress-bar">
                  <div 
                    className="progress" 
                    style={{width: `${uploadProgress}%`}}
                  ></div>
                </div>
              )}
            </div>
            
            <div className="form-actions">
              <button type="submit" disabled={loading}>
                {loading ? 'Uploading...' : 'Submit Certificate'}
              </button>
            </div>
          </div>
        </form>

        <div className="certificates-list">
          <h3 className="section-title">Your Certificates</h3>
          {certificates.length === 0 ? (
            <p>No certificates uploaded yet.</p>
          ) : (
            semesters.map(semester => {
              const semesterCerts = certificates.filter(cert => cert.semester === semester);
              if (semesterCerts.length === 0) return null;
              
              return (
                <div key={semester} className="semester-section">
                  <h4 className="semester-title">{semester}</h4>
                  <div className="table-responsive">
                    <table className="certificates-table">
                      <thead>
                        <tr>
                          <th>Course Title</th>
                          <th>Platform</th>
                          <th>Start Date</th>
                          <th>End Date</th>
                          <th>Hours/Week</th>
                          <th>Certificate</th>
                        </tr>
                      </thead>
                      <tbody>
                        {semesterCerts.map((cert, index) => (
                          <tr key={index}>
                            <td>{cert.title}</td>
                            <td>{cert.platform}</td>
                            <td>{new Date(cert.start_date).toLocaleDateString()}</td>
                            <td>{new Date(cert.end_date).toLocaleDateString()}</td>
                            <td>{cert.hours_per_week}</td>
                            <td>
                              <a 
                                href={cert.certificate_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="view-certificate-btn"
                              >
                                View
                              </a>
                            </td>
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
      </div>
      <Footer />
    </div>
  );
};

export default StudentMooc;
