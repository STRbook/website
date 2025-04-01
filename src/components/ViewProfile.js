import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import './styles/Profile.css';
import Header from './Header';
import Footer from './Footer';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

const ViewProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profilePicUrl, setProfilePicUrl] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState(null);
  const { student_id: param_student_id } = useParams(); 
  const navigate = useNavigate();
  
  const getLoggedInStudentId = () => {
    const userString = localStorage.getItem('user');
    if (userString) {
      try {
        const user = JSON.parse(userString);
        return user?.id?.toString(); // Ensure it's a string for comparison
      } catch (e) {
        console.error("Failed to parse user data from localStorage", e);
        return null;
      }
    }
    return null;
  };

  const loggedInStudentId = getLoggedInStudentId();
  const current_student_id = param_student_id || loggedInStudentId; // Use param ID if present, otherwise logged-in user's ID
  const isOwnProfile = !param_student_id || param_student_id === loggedInStudentId;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }
        
        if (!current_student_id) {
          console.error("Student ID not found in URL params or localStorage.");
          setError("Could not determine student profile to fetch.");
          setLoading(false);
          
          return;
        }

        const response = await fetch(`${API_BASE_URL}/api/student-profile/${current_student_id}`, {
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
          throw new Error(response.status === 404 ? 'Profile not found' : 'Failed to fetch profile');
        }

        const data = await response.json();
        setProfile(data);

        if (data.profile_picture_url) {
          try {
            const storage = getStorage();
            const downloadUrl = await getDownloadURL(ref(storage, data.profile_picture_url));
            setProfilePicUrl(downloadUrl);
          } catch (firebaseError) {
            setProfilePicUrl('/default-profile.png');
          }
        } else {
          setProfilePicUrl('/default-profile.png');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [current_student_id, navigate]); // Depend on current_student_id

  useEffect(() => {
    if (profile) {
      const profileCopy = JSON.parse(JSON.stringify(profile));
      
      if (!profileCopy.addresses) {
        profileCopy.addresses = [];
      }
      
      if (!profileCopy.academic_records) {
        profileCopy.academic_records = [{
          degree: '',
          institution: '',
          year: '',
          grade: ''
        }];
      }
      
      const temporaryAddressIndex = profileCopy.addresses.findIndex(addr => addr.address_type === 'temporary');
      const permanentAddressIndex = profileCopy.addresses.findIndex(addr => addr.address_type === 'permanent');
      
      if (temporaryAddressIndex === -1) {
        profileCopy.addresses.push({
          address_type: 'temporary',
          street: '',
          city: '',
          state: '',
          zip_code: '',
          country: ''
        });
      }
      
      if (permanentAddressIndex === -1) {
        profileCopy.addresses.push({
          address_type: 'permanent',
          street: '',
          city: '',
          state: '',
          zip_code: '',
          country: ''
        });
      }
      
      setEditedProfile(profileCopy);
    }
  }, [profile]);

  const handleInputChange = (section, field, value, index = null) => {
    setEditedProfile(prev => {
      const updated = { ...prev };
      
      if (section === 'addresses' && index !== null) {
        if (!updated.addresses) {
          updated.addresses = [];
        }
        
        if (!updated.addresses[index]) {
          updated.addresses[index] = {
            address_type: index === 0 ? 'temporary' : 'permanent'
          };
        }
        
        updated.addresses[index] = {
          ...updated.addresses[index],
          [field]: value
        };
      } else if (section === 'academic_records' && index !== null) {
        if (!updated.academic_records) {
          updated.academic_records = [];
        }
        
        if (!updated.academic_records[index]) {
          updated.academic_records[index] = {
            degree: '',
            institution: '',
            year: '',
            grade: ''
          };
        }
        
        updated.academic_records[index] = {
          ...updated.academic_records[index],
          [field]: value
        };
      } else if (section === 'parent_info') {
        if (!updated.parent_info) {
          updated.parent_info = {};
        }
        updated.parent_info[field] = value;
      } else {
        updated[field] = value;
      }
      
      return updated;
    });
  };

  const addAcademicRecord = () => {
    setEditedProfile(prev => ({
      ...prev,
      academic_records: [
        ...(prev.academic_records || []),
        {
          degree: '',
          institution: '',
          year: '',
          grade: ''
        }
      ]
    }));
  };

  const removeAcademicRecord = (index) => {
    setEditedProfile(prev => ({
      ...prev,
      academic_records: prev.academic_records.filter((_, i) => i !== index)
    }));
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Validate academic records
      if (editedProfile.academic_records) {
        const invalidRecords = editedProfile.academic_records.filter(
          record => !record.degree || !record.institution || !record.year || !record.grade
        );
        if (invalidRecords.length > 0) {
          alert('Please fill in all fields for academic records (Degree, Institution, Year, and Grade)');
          return;
        }
      }

      
      const response = await fetch(`${API_BASE_URL}/api/student-profile/update`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...editedProfile,
          // Ensure these fields are properly formatted
          dob: editedProfile.dob ? new Date(editedProfile.dob).toISOString().split('T')[0] : null,
          parent_info: editedProfile.parent_info || null,
          addresses: editedProfile.addresses || [],
          academic_records: editedProfile.academic_records || []
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }

      const updatedProfile = await response.json();
      setProfile(updatedProfile);
      setEditedProfile(JSON.parse(JSON.stringify(updatedProfile)));
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (err) {
      console.error('Profile update error:', err); 
      alert('Failed to update profile: ' + err.message);
    }
  };

  const renderEditableField = (section, field, value, label, index = null) => {
    const currentValue = isEditing 
      ? (index !== null 
          ? editedProfile?.[section]?.[index]?.[field] 
          : section === 'base' 
            ? editedProfile?.[field] 
            : editedProfile?.[section]?.[field]) 
      : value;

    return isEditing ? (
      <div className="info-item">
        <label>{label}</label>
        <input
          type="text"
          value={currentValue || ''}
          onChange={(e) => handleInputChange(section, field, e.target.value, index)}
          className="edit-input"
        />
      </div>
    ) : (
      <div className="info-item">
        <label>{label}</label>
        <span>{value}</span>
      </div>
    );
  };

  if (loading) return <div className="loading">Loading profile...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!profile) return <div className="profile-not-found">Profile not found</div>;

  const temporaryAddress = (isEditing ? editedProfile : profile).addresses?.find(addr => addr.address_type === 'temporary');
  const permanentAddress = (isEditing ? editedProfile : profile).addresses?.find(addr => addr.address_type === 'permanent');

  return (
    <div className="profile-container">
      <Header userType="student" />
      <div className="profile-content">
        <div className="profile-view">
          <div className="profile-header-actions">
            <h2>Student Profile</h2>
            {isOwnProfile && (
              <div className="edit-actions">
                {isEditing ? (
                  <>
                    <button className="save-btn" onClick={handleSave}>Save Changes</button>
                    <button 
                      className="cancel-btn" 
                      onClick={() => {
                        setEditedProfile(JSON.parse(JSON.stringify(profile)));
                        setIsEditing(false);
                      }}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button className="edit-btn" onClick={() => setIsEditing(true)}>
                    Edit Profile
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="profile-sections-grid">
            <div className="profile-section full-width">
              <div className="profile-header">
                <div className="profile-picture">
                  <img 
                    src={profilePicUrl || '/default-profile.png'} 
                    alt={`${(isEditing ? editedProfile : profile)?.first_name}'s profile`}
                    onError={(e) => e.target.src = '/default-profile.png'}
                  />
                </div>
                <div className="profile-name">
                  {renderEditableField('base', 'first_name', profile.first_name, 'First Name')}
                  {renderEditableField('base', 'last_name', profile.last_name, 'Last Name')}
                  <div className="usn">USN: {profile.usn}</div>
                </div>
              </div>

              <div className="info-grid">
                {renderEditableField('base', 'dob', profile.dob, 'Date of Birth')}
                {renderEditableField('base', 'phone', profile.phone, 'Phone')}
                {renderEditableField('base', 'email', profile.email, 'Email')}
              </div>
            </div>

            {(isEditing ? editedProfile : profile).parent_info && (
              <div className="profile-section">
                <h3>Parent Information</h3>
                <div className="info-grid">
                  {renderEditableField('parent_info', 'father_name', profile.parent_info.father_name, "Father's Name")}
                  {renderEditableField('parent_info', 'mother_name', profile.parent_info.mother_name, "Mother's Name")}
                  {renderEditableField('parent_info', 'contact', profile.parent_info.contact, 'Contact')}
                  {renderEditableField('parent_info', 'email', profile.parent_info.email, 'Email')}
                </div>
              </div>
            )}

            <div className="profile-section full-width">
              <h3>Address Information</h3>
              {temporaryAddress && (
                <div className="address-block">
                  <h4>Temporary Address</h4>
                  <div className="info-grid">
                    {renderEditableField('addresses', 'street', temporaryAddress.street, 'Street', 0)}
                    {renderEditableField('addresses', 'city', temporaryAddress.city, 'City', 0)}
                    {renderEditableField('addresses', 'state', temporaryAddress.state, 'State', 0)}
                    {renderEditableField('addresses', 'zip_code', temporaryAddress.zip_code, 'Zip Code', 0)}
                    {renderEditableField('addresses', 'country', temporaryAddress.country, 'Country', 0)}
                  </div>
                </div>
              )}

              {permanentAddress && (
                <div className="address-block">
                  <h4>Permanent Address</h4>
                  <div className="info-grid">
                    {renderEditableField('addresses', 'street', permanentAddress.street, 'Street', 1)}
                    {renderEditableField('addresses', 'city', permanentAddress.city, 'City', 1)}
                    {renderEditableField('addresses', 'state', permanentAddress.state, 'State', 1)}
                    {renderEditableField('addresses', 'zip_code', permanentAddress.zip_code, 'Zip Code', 1)}
                    {renderEditableField('addresses', 'country', permanentAddress.country, 'Country', 1)}
                  </div>
                </div>
              )}
            </div>

            <div className="profile-section full-width">
              <div className="section-header">
                <h3>Academic Records</h3>
                {isEditing && (
                  <button 
                    className="add-record-btn"
                    onClick={addAcademicRecord}
                  >
                    Add Record
                  </button>
                )}
              </div>
              <table className="academic-table">
                <thead>
                  <tr>
                    <th>Degree</th>
                    <th>Institution</th>
                    <th>Year</th>
                    <th>Grade</th>
                    {isEditing && <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {(isEditing ? editedProfile : profile).academic_records?.length > 0 ? (
                    (isEditing ? editedProfile : profile).academic_records.map((record, index) => (
                      <tr key={index}>
                        <td>
                          {isEditing ? (
                            <input
                              type="text"
                              value={record.degree || ''}
                              onChange={(e) => handleInputChange('academic_records', 'degree', e.target.value, index)}
                              className="edit-input"
                              required
                            />
                          ) : (
                            record.degree
                          )}
                        </td>
                        <td>
                          {isEditing ? (
                            <input
                              type="text"
                              value={record.institution || ''}
                              onChange={(e) => handleInputChange('academic_records', 'institution', e.target.value, index)}
                              className="edit-input"
                              required
                            />
                          ) : (
                            record.institution
                          )}
                        </td>
                        <td>
                          {isEditing ? (
                            <input
                              type="number"
                              value={record.year || ''}
                              onChange={(e) => handleInputChange('academic_records', 'year', e.target.value, index)}
                              className="edit-input"
                              required
                            />
                          ) : (
                            record.year
                          )}
                        </td>
                        <td>
                          {isEditing ? (
                            <input
                              type="text"
                              value={record.grade || ''}
                              onChange={(e) => handleInputChange('academic_records', 'grade', e.target.value, index)}
                              className="edit-input"
                              required
                            />
                          ) : (
                            record.grade
                          )}
                        </td>
                        {isEditing && (
                          <td>
                            <button
                              className="remove-record-btn"
                              onClick={() => removeAcademicRecord(index)}
                            >
                              Remove
                            </button>
                          </td>
                        )}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={isEditing ? 5 : 4} className="no-records">
                        {isEditing ? (
                          "Add your academic records using the 'Add Record' button above"
                        ) : (
                          "No academic records available"
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

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
