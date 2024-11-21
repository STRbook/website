import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import './styles/Profile.css';
import Header from './Header';
import Footer from './Footer';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const ViewProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profilePicUrl, setProfilePicUrl] = useState(null);
  const { student_id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await fetch(`${API_BASE_URL}/api/student-profile/${student_id || localStorage.getItem('student_id')}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('student_id');
            navigate('/login');
            return;
          }
          const errorText = await response.text();
          console.error('API Error:', response.status, errorText);
          throw new Error(response.status === 404 ? 'Profile not found' : 'Failed to fetch profile');
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          console.error('Invalid content type:', contentType);
          throw new Error('Invalid response from server');
        }

        const data = await response.json();
        console.log('Profile data:', data);
        setProfile(data);

        // Fetch profile picture if available
        if (data.profile_picture_url) {
          try {
            const storage = getStorage();
            const imageRef = ref(storage, data.profile_picture_url);
            const url = await getDownloadURL(imageRef);
            setProfilePicUrl(url);
          } catch (imgError) {
            console.error('Error loading profile picture:', imgError);
            // Don't throw error for image loading issues
          }
        }
      } catch (err) {
        console.error('Profile fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [student_id, navigate]);

  if (loading) {
    return <div className="loading">Loading profile...</div>;
  }

  if (error) {
    return (
      <div className="error-message">
        <p>{error}</p>
        <button className="error-action-btn" onClick={() => navigate(-1)}>
          Go Back
        </button>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="profile-not-found">
        <h2>Profile Not Found</h2>
        <p>The requested student profile could not be found.</p>
        <button className="error-action-btn" onClick={() => navigate(-1)}>
          Go Back
        </button>
      </div>
    );
  }

  const currentAddress = profile.addresses?.find(addr => addr.address_type === 'current');
  const permanentAddress = profile.addresses?.find(addr => addr.address_type === 'permanent');

  return (
    <div className="profile-container">
      <Header userType="student" />
      <div className="profile-content">
        <div className="profile-view">
          <h2>Student Profile</h2>
          <div className="profile-sections-grid">
            <div className="profile-section full-width">
              <div className="profile-header">
                <div className="profile-picture">
                  <img 
                    src={profilePicUrl || '/default-profile.png'} 
                    alt={`${profile.first_name}'s profile`} 
                  />
                </div>
                <div className="profile-name">
                  <h3>{profile.first_name} {profile.last_name}</h3>
                  <div className="usn">USN: {profile.usn}</div>
                </div>
              </div>

              <div className="info-grid">
                <div className="info-item">
                  <label>Date of Birth</label>
                  <span>{new Date(profile.dob).toLocaleDateString()}</span>
                </div>
                <div className="info-item">
                  <label>Phone</label>
                  <span>{profile.phone}</span>
                </div>
                <div className="info-item">
                  <label>Email</label>
                  <span>{profile.email}</span>
                </div>
              </div>
            </div>

            {profile.parent_info && (
              <div className="profile-section">
                <h3>Parent Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Father's Name</label>
                    <span>{profile.parent_info.father_name}</span>
                  </div>
                  <div className="info-item">
                    <label>Mother's Name</label>
                    <span>{profile.parent_info.mother_name}</span>
                  </div>
                  <div className="info-item">
                    <label>Contact</label>
                    <span>{profile.parent_info.contact}</span>
                  </div>
                  <div className="info-item">
                    <label>Email</label>
                    <span>{profile.parent_info.email}</span>
                  </div>
                </div>
              </div>
            )}

            {profile.sibling_info && profile.sibling_info.length > 0 && (
              <div className="profile-section">
                <h3>Sibling Information</h3>
                <div className="info-grid">
                  {profile.sibling_info.map((sibling, index) => (
                    <div key={index} className="info-item">
                      <label>{sibling.relationship}</label>
                      <span>{sibling.sibling_name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="profile-section full-width">
              <h3>Address Information</h3>
              {currentAddress && (
                <div className="address-block">
                  <h4>Current Address</h4>
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Street</label>
                      <span>{currentAddress.street}</span>
                    </div>
                    <div className="info-item">
                      <label>City</label>
                      <span>{currentAddress.city}</span>
                    </div>
                    <div className="info-item">
                      <label>State</label>
                      <span>{currentAddress.state}</span>
                    </div>
                    <div className="info-item">
                      <label>Zip Code</label>
                      <span>{currentAddress.zip_code}</span>
                    </div>
                    <div className="info-item">
                      <label>Country</label>
                      <span>{currentAddress.country}</span>
                    </div>
                  </div>
                </div>
              )}

              {permanentAddress && (
                <div className="address-block">
                  <h4>Permanent Address</h4>
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Street</label>
                      <span>{permanentAddress.street}</span>
                    </div>
                    <div className="info-item">
                      <label>City</label>
                      <span>{permanentAddress.city}</span>
                    </div>
                    <div className="info-item">
                      <label>State</label>
                      <span>{permanentAddress.state}</span>
                    </div>
                    <div className="info-item">
                      <label>Zip Code</label>
                      <span>{permanentAddress.zip_code}</span>
                    </div>
                    <div className="info-item">
                      <label>Country</label>
                      <span>{permanentAddress.country}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {profile.academic_records && profile.academic_records.length > 0 && (
              <div className="profile-section full-width">
                <h3>Academic Records</h3>
                <table className="academic-table">
                  <thead>
                    <tr>
                      <th>Degree</th>
                      <th>Institution</th>
                      <th>Year</th>
                      <th>Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profile.academic_records.map((record, index) => (
                      <tr key={index}>
                        <td>{record.degree}</td>
                        <td>{record.institution}</td>
                        <td>{record.year}</td>
                        <td>{record.grade}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {profile.hobbies && profile.hobbies.length > 0 && (
              <div className="profile-section">
                <h3>Hobbies & Interests</h3>
                <div className="hobbies-list">
                  {profile.hobbies.map((hobby, index) => (
                    <span key={index} className="hobby-tag">
                      {hobby.hobby_name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ViewProfile;
