// src/components/StudentProfile.js

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from './Header';
import Footer from './Footer';
import FileUpload from './FileUpload';
import './styles/Profile.css';

const StudentProfile = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [studentInfo, setStudentInfo] = useState({
    name: '',
    usn: '',
    email: '',
    gender: '',
    religion: '',
    nationality: '',
    phone: '',
    dob: '',
    hobbies: '',
    profilePicture: null
  });

  const [previewUrl, setPreviewUrl] = useState('');

  const [certificates, setCertificates] = useState({});
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');

  useEffect(() => {
    document.title = "Student Profile";
    fetchProfileData();
    fetchCertificates();
  }, []);

  const fetchProfileData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get('http://localhost:5000/api/student/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data && Object.keys(response.data).length > 0) {
        setStudentInfo(response.data.personalInfo);
      } else {
        // If no profile data exists, automatically enter edit mode
        setIsEditing(true);
        setError('Please complete your profile information.');
      }
    } catch (err) {
      if (err.response && err.response.status === 404) {
        // If profile not found, enter edit mode
        setIsEditing(true);
        setError('Please complete your profile information.');
      } else {
        setError('Error fetching profile data. Please try again later.');
        console.error('Error fetching profile:', err);
      }
    }
  };

  const fetchCertificates = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/files/certificate', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Organize certificates by semester
      const certsBySemester = response.data.reduce((acc, cert) => {
        acc[cert.semester] = cert;
        return acc;
      }, {});
      
      setCertificates(certsBySemester);
    } catch (error) {
      console.error('Error fetching certificates:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setStudentInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setStudentInfo(prev => ({
        ...prev,
        profilePicture: file
      }));

      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const required = ['name', 'usn', 'gender', 'nationality', 'phone', 'religion'];
    const missing = required.filter(field => !studentInfo[field]);
    
    if (missing.length > 0) {
      setError(`Please fill in all required fields: ${missing.join(', ')}`);
      return false;
    }
    
    // Basic phone validation
    const phoneRegex = /^\+?[\d\s-]{10,}$/;
    if (!phoneRegex.test(studentInfo.phone)) {
      setError('Please enter a valid phone number');
      return false;
    }

    // Basic email validation if provided
    if (studentInfo.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(studentInfo.email)) {
        setError('Please enter a valid email address');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    try {
      if (!validateForm()) {
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      console.log('Sending profile data:', { personalInfo: studentInfo }); // Debug log

      const response = await axios.post(
        'http://localhost:5000/api/student/profile',
        { personalInfo: studentInfo }, // Wrap in personalInfo object
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 200 || response.status === 201) {
        setSuccessMessage('Profile updated successfully!');
        setError('');
        setIsEditing(false);
        // Refresh profile data
        fetchProfileData();
      }
    } catch (err) {
      console.error('Profile update error:', err.response?.data || err); // Debug log
      setError(err.response?.data?.message || 'Error updating profile. Please try again.');
    }
  };

  const handleProfileUploadSuccess = (downloadUrl) => {
    setStudentInfo(prev => ({
      ...prev,
      profilePicture: downloadUrl
    }));
    setUploadSuccess('Profile picture uploaded successfully!');
    setTimeout(() => setUploadSuccess(''), 3000);
  };

  const handleCertificateUploadSuccess = (downloadUrl, semester) => {
    setCertificates(prev => ({
      ...prev,
      [semester]: { file_url: downloadUrl, semester }
    }));
    setUploadSuccess(`Certificate for semester ${semester} uploaded successfully!`);
    setTimeout(() => setUploadSuccess(''), 3000);
  };

  const handleUploadError = (error) => {
    setUploadError(error);
    setTimeout(() => setUploadError(''), 5000);
  };

  return (
    <div className="profile-container">
      {uploadError && <div className="error-message">{uploadError}</div>}
      {uploadSuccess && <div className="success-message">{uploadSuccess}</div>}
      
      <Header userType="student" />
      <main className="profile-content">
        <h2>Student Profile</h2>
        {error && <p className="error">{error}</p>}
        {successMessage && <p className="success">{successMessage}</p>}

        {/* Profile Form */}
        <form className="profile-form" onSubmit={(e) => e.preventDefault()}>
          <div className="form-grid">
            {/* Column 1: Basic Info */}
            <div className="form-column">
              <h3>Basic Information</h3>
              <div className="form-group">
                <label>Name*:</label>
                <input
                  type="text"
                  value={studentInfo.name}
                  onChange={handleInputChange}
                  name="name"
                  required
                />
              </div>
              <div className="form-group">
                <label>USN*:</label>
                <input
                  type="text"
                  value={studentInfo.usn}
                  onChange={handleInputChange}
                  name="usn"
                  required
                />
              </div>
              <div className="form-group">
                <label>Email:</label>
                <input
                  type="email"
                  value={studentInfo.email}
                  onChange={handleInputChange}
                  name="email"
                />
              </div>
            </div>

            {/* Column 2: Personal Details */}
            <div className="form-column">
              <h3>Personal Details</h3>
              <div className="form-group">
                <label>Gender*:</label>
                <select
                  value={studentInfo.gender}
                  onChange={handleInputChange}
                  name="gender"
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Religion*:</label>
                <input
                  type="text"
                  value={studentInfo.religion}
                  onChange={handleInputChange}
                  name="religion"
                  required
                />
              </div>
              <div className="form-group">
                <label>Nationality*:</label>
                <input
                  type="text"
                  value={studentInfo.nationality}
                  onChange={handleInputChange}
                  name="nationality"
                  required
                />
              </div>
            </div>

            {/* Column 3: Contact & Additional Info */}
            <div className="form-column">
              <h3>Contact & Additional Info</h3>
              <div className="form-group">
                <label>Phone*:</label>
                <input
                  type="tel"
                  value={studentInfo.phone}
                  onChange={handleInputChange}
                  name="phone"
                  required
                />
              </div>
              <div className="form-group">
                <label>Date of Birth:</label>
                <input
                  type="date"
                  value={studentInfo.dob}
                  onChange={handleInputChange}
                  name="dob"
                />
              </div>
              <div className="form-group">
                <label>Hobbies:</label>
                <textarea
                  value={studentInfo.hobbies}
                  onChange={handleInputChange}
                  name="hobbies"
                  placeholder="Enter your hobbies (comma separated)"
                />
              </div>
            </div>

            {/* Column 4: Profile Picture */}
            <div className="profile-picture-section">
              <h3>Profile Picture</h3>
              <div className="profile-picture-container">
                {studentInfo.profilePicture && (
                  <img 
                    src={studentInfo.profilePicture} 
                    alt="Profile" 
                    className="profile-preview"
                  />
                )}
                <FileUpload
                  type="profile"
                  onUploadSuccess={handleProfileUploadSuccess}
                  onUploadError={handleUploadError}
                  acceptedTypes={['image/jpeg', 'image/png', 'image/webp']}
                  maxSize={2 * 1024 * 1024} // 2MB
                  preview={true}
                />
              </div>
            </div>

            {/* Column 5: Certificates */}
            <div className="certificates-section">
              <h3>MOOC Certificates</h3>
              <div className="certificates-grid">
                {Array.from({ length: 8 }, (_, i) => i + 1).map(semester => (
                  <div key={semester} className="certificate-item">
                    <h4>Semester {semester}</h4>
                    {certificates[semester] ? (
                      <div className="certificate-preview">
                        <a 
                          href={certificates[semester].file_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          View Certificate
                        </a>
                      </div>
                    ) : (
                      <FileUpload
                        type="certificate"
                        semester={semester}
                        onUploadSuccess={(url) => handleCertificateUploadSuccess(url, semester)}
                        onUploadError={handleUploadError}
                        acceptedTypes={['application/pdf']}
                        maxSize={10 * 1024 * 1024} // 10MB
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            {isEditing ? (
              <button onClick={handleSubmit} className="submit-btn">Save Profile</button>
            ) : (
              <button onClick={() => setIsEditing(true)} className="edit-btn">Edit Profile</button>
            )}
          </div>
        </form>
      </main>
      <Footer />
    </div>
  );
};

export default StudentProfile;
