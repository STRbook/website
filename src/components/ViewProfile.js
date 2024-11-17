import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import './styles/Profile.css';

const ViewProfile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const studentId = localStorage.getItem('studentId');
        const token = localStorage.getItem('token');

        console.log('StudentId:', studentId);
        console.log('Token:', token ? 'exists' : 'missing');

        if (!studentId || !token) {
          console.log('Missing credentials, redirecting to login');
          navigate('/login');
          return;
        }

        console.log('Fetching profile...');
        const response = await fetch(`http://localhost:5000/api/student-profile/${studentId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('Response status:', response.status);
        
        if (!response.ok) {
          if (response.status === 401) {
            console.log('Unauthorized, redirecting to login');
            localStorage.removeItem('token');
            localStorage.removeItem('studentId');
            navigate('/login');
            return;
          }
          
          const errorData = await response.json().catch(() => null);
          throw new Error(errorData?.message || 'Failed to fetch profile');
        }

        const data = await response.json();
        console.log('Profile data:', data);
        
        if (!data.profile_completed) {
          console.log('Profile not completed, redirecting to profile creation');
          navigate('/student-profile');
          return;
        }

        setProfile(data);
      } catch (err) {
        console.error('Profile fetch error:', err);
        setError(err.message || 'Failed to fetch profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  if (loading) {
    return (
      <div className="profile-container">
        <Header userType="student" />
        <main className="profile-content">
          <div className="loading">Loading profile...</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-container">
        <Header userType="student" />
        <main className="profile-content">
          <div className="error-message">
            {error}
            <button 
              onClick={() => navigate('/student-profile')} 
              className="error-action-btn"
            >
              Create Profile
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="profile-container">
        <Header userType="student" />
        <main className="profile-content">
          <div className="profile-not-found">
            <h2>Profile Not Found</h2>
            <p>You haven't created your profile yet.</p>
            <button 
              onClick={() => navigate('/student-profile')} 
              className="create-profile-btn"
            >
              Create Profile
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="profile-container">
      <Header userType="student" />
      <main className="profile-content">
        <div className="profile-view">
          <h2>Student Profile</h2>

          <section className="profile-section">
            <h3>Personal Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Name:</label>
                <span>{profile.first_name} {profile.last_name}</span>
              </div>
              <div className="info-item">
                <label>USN:</label>
                <span>{profile.usn}</span>
              </div>
              <div className="info-item">
                <label>Date of Birth:</label>
                <span>{new Date(profile.dob).toLocaleDateString()}</span>
              </div>
              <div className="info-item">
                <label>Phone:</label>
                <span>{profile.phone}</span>
              </div>
              <div className="info-item">
                <label>Email:</label>
                <span>{profile.email}</span>
              </div>
            </div>
          </section>

          {profile.parent_info && (
            <section className="profile-section">
              <h3>Parent Information</h3>
              <div className="info-grid">
                <div className="info-item">
                  <label>Father's Name:</label>
                  <span>{profile.parent_info.father_name}</span>
                </div>
                <div className="info-item">
                  <label>Mother's Name:</label>
                  <span>{profile.parent_info.mother_name}</span>
                </div>
                <div className="info-item">
                  <label>Contact:</label>
                  <span>{profile.parent_info.contact}</span>
                </div>
                <div className="info-item">
                  <label>Email:</label>
                  <span>{profile.parent_info.email}</span>
                </div>
              </div>
            </section>
          )}

          {profile.addresses && profile.addresses.length > 0 && (
            <section className="profile-section">
              <h3>Addresses</h3>
              {profile.addresses.map((address, index) => (
                <div key={index} className="address-block">
                  <h4>{address.address_type.charAt(0).toUpperCase() + address.address_type.slice(1)} Address</h4>
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Street:</label>
                      <span>{address.street}</span>
                    </div>
                    <div className="info-item">
                      <label>City:</label>
                      <span>{address.city}</span>
                    </div>
                    <div className="info-item">
                      <label>State:</label>
                      <span>{address.state}</span>
                    </div>
                    <div className="info-item">
                      <label>ZIP Code:</label>
                      <span>{address.zip_code}</span>
                    </div>
                    <div className="info-item">
                      <label>Country:</label>
                      <span>{address.country}</span>
                    </div>
                  </div>
                </div>
              ))}
            </section>
          )}

          {profile.academic_records && profile.academic_records.length > 0 && (
            <section className="profile-section">
              <h3>Academic Records</h3>
              <table className="academic-table">
                <thead>
                  <tr>
                    <th>Semester</th>
                    <th>GPA</th>
                  </tr>
                </thead>
                <tbody>
                  {profile.academic_records.map((record, index) => (
                    <tr key={index}>
                      <td>{record.semester}</td>
                      <td>{record.gpa}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}

          {profile.siblings && profile.siblings.length > 0 && (
            <section className="profile-section">
              <h3>Siblings</h3>
              <div className="info-list">
                {profile.siblings.map((sibling, index) => (
                  <div key={index} className="info-item">
                    <span>{sibling.sibling_name}</span>
                    <span className="relationship">({sibling.relationship})</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {profile.hobbies && profile.hobbies.length > 0 && (
            <section className="profile-section">
              <h3>Hobbies</h3>
              <div className="hobbies-list">
                {profile.hobbies.map((hobby, index) => (
                  <span key={index} className="hobby-tag">
                    {hobby.hobby_name}
                  </span>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ViewProfile;
