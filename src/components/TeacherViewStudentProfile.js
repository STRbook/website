import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import './styles/Profile.css'; // Reuse existing profile styles
import Header from './Header';
import Footer from './Footer';
import { API_ENDPOINTS } from '../config/api'; // Import API endpoints

const TeacherViewStudentProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profilePicUrl, setProfilePicUrl] = useState('/default-profile.png'); // Default image
  const { studentId } = useParams(); // Get studentId from URL parameter
  const navigate = useNavigate();

  useEffect(() => {
    document.title = `Viewing Profile - ${profile ? (profile.first_name + ' ' + profile.last_name) : studentId}`;
  }, [profile, studentId]);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token'); // Teacher's token

      if (!token) {
        setError('Authentication token not found. Please log in.');
        setLoading(false);
        navigate('/login'); // Redirect teacher to login if not authenticated
        return;
      }

      if (!studentId) {
        setError('Student ID not provided in URL.');
        setLoading(false);
        return;
      }

      try {
        // Use the standard student profile endpoint, assuming backend handles teacher authorization
        const response = await fetch(`${API_ENDPOINTS.STUDENT_PROFILE}/${studentId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          if (response.status === 401 || response.status === 403) {
            // Handle unauthorized access specifically
            setError(errorData.message || 'Unauthorized to view this profile.');
            // Optional: Redirect or show specific message
          } else if (response.status === 404) {
             setError('Student profile not found.');
          } else {
            throw new Error(errorData.message || `Failed to fetch profile (Status: ${response.status})`);
          }
        } else {
          const data = await response.json();
          console.log("Fetched student profile data:", data); // Log the received data
          setProfile(data);

          // Fetch profile picture from Firebase Storage if URL exists
          if (data.profile_picture_url) {
            try {
              const storage = getStorage();
              const downloadUrl = await getDownloadURL(ref(storage, data.profile_picture_url));
              setProfilePicUrl(downloadUrl);
            } catch (firebaseError) {
              console.error("Firebase Storage Error:", firebaseError);
              // Keep the default profile picture if Firebase fetch fails
              setProfilePicUrl('/default-profile.png');
            }
          } else {
            setProfilePicUrl('/default-profile.png');
          }
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError(err.message || 'An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [studentId, navigate]);

  // Helper to render profile fields safely
  const renderField = (value, label) => (
    <div className="info-item">
      <label>{label}</label>
      <span>{value || 'N/A'}</span> {/* Display N/A if value is missing */}
    </div>
  );

  if (loading) return <div className="loading">Loading profile...</div>;
  if (error) return <div className="error-message">Error: {error}</div>;
  if (!profile) return <div className="profile-not-found">Profile data could not be loaded.</div>;

  // Find addresses (assuming the structure from ViewProfile.js)
  const temporaryAddress = profile.addresses?.find(addr => addr.address_type === 'temporary');
  const permanentAddress = profile.addresses?.find(addr => addr.address_type === 'permanent');

  return (
    <div className="profile-container">
      {/* Header now determines role internally */}
      <Header /> 
      <div className="profile-content">
        <div className="profile-view">
          <div className="profile-header-actions">
            {/* Simplified header for viewing */}
            <h2>Student Profile: {profile.first_name} {profile.last_name}</h2>
          </div>

          <div className="profile-sections-grid">
            {/* Basic Info Section */}
            <div className="profile-section full-width">
              <div className="profile-header">
                <div className="profile-picture">
                  <img 
                    src={profilePicUrl} 
                    alt={`${profile.first_name}'s profile`}
                    onError={(e) => e.target.src = '/default-profile.png'} // Fallback
                  />
                </div>
                <div className="profile-name">
                  {renderField(profile.first_name, 'First Name')}
                  {renderField(profile.last_name, 'Last Name')}
                  <div className="usn">USN: {profile.usn || 'N/A'}</div>
                </div>
              </div>
              <div className="info-grid">
                {renderField(profile.dob ? new Date(profile.dob).toLocaleDateString() : null, 'Date of Birth')}
                {renderField(profile.phone, 'Phone')}
                {renderField(profile.email, 'Email')}
              </div>
            </div>

            {/* Parent Info Section */}
            {profile.parent_info && (
              <div className="profile-section">
                <h3>Parent Information</h3>
                <div className="info-grid">
                  {renderField(profile.parent_info.father_name, "Father's Name")}
                  {renderField(profile.parent_info.mother_name, "Mother's Name")}
                  {renderField(profile.parent_info.contact, 'Contact')}
                  {renderField(profile.parent_info.email, 'Email')}
                </div>
              </div>
            )}

            {/* Address Section */}
            <div className="profile-section full-width">
              <h3>Address Information</h3>
              {temporaryAddress && (
                <div className="address-block">
                  <h4>Temporary Address</h4>
                  <div className="info-grid">
                    {renderField(temporaryAddress.street, 'Street')}
                    {renderField(temporaryAddress.city, 'City')}
                    {renderField(temporaryAddress.state, 'State')}
                    {renderField(temporaryAddress.zip_code, 'Zip Code')}
                    {renderField(temporaryAddress.country, 'Country')}
                  </div>
                </div>
              )}
              {permanentAddress && (
                <div className="address-block">
                  <h4>Permanent Address</h4>
                  <div className="info-grid">
                    {renderField(permanentAddress.street, 'Street')}
                    {renderField(permanentAddress.city, 'City')}
                    {renderField(permanentAddress.state, 'State')}
                    {renderField(permanentAddress.zip_code, 'Zip Code')}
                    {renderField(permanentAddress.country, 'Country')}
                  </div>
                </div>
              )}
               {!temporaryAddress && !permanentAddress && <p>No address information available.</p>}
            </div>

            {/* Academic Records Section */}
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
                  {profile.academic_records?.length > 0 ? (
                    profile.academic_records.map((record, index) => (
                      <tr key={index}>
                        <td>{record.degree || 'N/A'}</td>
                        <td>{record.institution || 'N/A'}</td>
                        <td>{record.year || 'N/A'}</td>
                        <td>{record.grade || 'N/A'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="no-records">No academic records available.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Hobbies Section */}
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

            {/* Projects Section */}
            <div className="profile-section full-width">
              <h3>Projects</h3>
              {profile.projects?.length > 0 ? (
                <table className="data-table"> {/* Use a generic class or style similarly */}
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Description</th>
                      <th>Technologies</th>
                      <th>Link</th>
                      {/* Add other relevant project fields */}
                    </tr>
                  </thead>
                  <tbody>
                    {profile.projects.map((project, index) => (
                      <tr key={index}>
                        <td>{project.title || 'N/A'}</td>
                        <td>{project.description || 'N/A'}</td>
                        <td>{project.technologies || 'N/A'}</td>
                        <td>
                          {project.link ? (
                            <a href={project.link} target="_blank" rel="noopener noreferrer">
                              View Project
                            </a>
                          ) : (
                            'N/A'
                          )}
                        </td>
                        {/* Render other fields */}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="no-records">No projects available.</p>
              )}
            </div>

            {/* MOOC Certificates Section */}
            <div className="profile-section full-width">
              <h3>MOOC Certificates</h3>
              {profile.mooc_certificates?.length > 0 ? (
                 <table className="data-table"> {/* Use a generic class or style similarly */}
                   <thead>
                     <tr>
                       <th>Course Name</th>
                       <th>Platform</th>
                       <th>Issued Date</th>
                       <th>Certificate URL</th>
                       {/* Add other relevant MOOC fields */}
                     </tr>
                   </thead>
                   <tbody>
                     {profile.mooc_certificates.map((mooc, index) => (
                       <tr key={index}>
                         <td>{mooc.course_name || 'N/A'}</td>
                         <td>{mooc.platform || 'N/A'}</td>
                         <td>{mooc.completed_date ? new Date(mooc.completed_date).toLocaleDateString() : 'N/A'}</td>
                         <td>
                           {mooc.certificate_url ? (
                             <a href={mooc.certificate_url} target="_blank" rel="noopener noreferrer">
                               View Certificate
                             </a>
                           ) : (
                             'N/A'
                           )}
                         </td>
                          {/* Render other fields */}
                       </tr>
                     ))}
                   </tbody>
                 </table>
              ) : (
                 <p className="no-records">No MOOC certificates available.</p>
              )}
            </div>

          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TeacherViewStudentProfile;
