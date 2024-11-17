// src/components/StudentProfile.js

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import './styles/Profile.css';

const StudentProfile = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Form data state
  const [formData, setFormData] = useState({
    // Student Profile
    first_name: '',
    last_name: '',
    usn: '',
    dob: '',
    phone: '',

    // Parent Info
    father_name: '',
    mother_name: '',
    parent_contact: '',
    parent_email: '',

    // Addresses
    permanent_address: {
      street: '',
      city: '',
      state: '',
      zip_code: '',
      country: ''
    },
    temporary_address: {
      street: '',
      city: '',
      state: '',
      zip_code: '',
      country: ''
    },

    // Academic Records
    academic_records: [
      { semester: 'Semester 1', gpa: '' },
      { semester: 'Semester 2', gpa: '' },
      { semester: 'Semester 3', gpa: '' },
      { semester: 'Semester 4', gpa: '' }
    ],

    // Sibling Info
    siblings: [{ sibling_name: '', relationship: '' }],

    // Hobbies
    hobbies: ['']
  });

  const handleInputChange = (section, field, value, index = null) => {
    setFormData(prev => {
      const newData = { ...prev };
      
      if (index !== null) {
        // Handle array fields (academic_records, siblings, hobbies)
        if (section === 'academic_records') {
          newData.academic_records[index].gpa = value;
        } else if (section === 'siblings') {
          if (!newData.siblings[index]) {
            newData.siblings[index] = {};
          }
          newData.siblings[index][field] = value;
        } else if (section === 'hobbies') {
          newData.hobbies[index] = value;
        }
      } else if (section === 'address') {
        // Handle nested address objects
        newData[field] = { ...prev[field], ...value };
      } else {
        // Handle flat fields
        newData[field] = value;
      }
      
      return newData;
    });
  };

  const addArrayField = (field) => {
    setFormData(prev => {
      const newData = { ...prev };
      if (field === 'siblings') {
        newData.siblings.push({ sibling_name: '', relationship: '' });
      } else if (field === 'hobbies') {
        newData.hobbies.push('');
      }
      return newData;
    });
  };

  const removeArrayField = (field, index) => {
    setFormData(prev => {
      const newData = { ...prev };
      if (field === 'siblings' || field === 'hobbies') {
        newData[field].splice(index, 1);
      }
      return newData;
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      const studentId = localStorage.getItem('studentId');
      const token = localStorage.getItem('token');

      const response = await fetch('http://localhost:5000/api/student-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          studentId,
          ...formData
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to save profile');
      }

      // Redirect to dashboard after successful profile completion
      navigate('/student-dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="form-step">
            <h3>Personal Information</h3>
            <input
              type="text"
              placeholder="First Name"
              value={formData.first_name}
              onChange={(e) => handleInputChange('profile', 'first_name', e.target.value)}
            />
            <input
              type="text"
              placeholder="Last Name"
              value={formData.last_name}
              onChange={(e) => handleInputChange('profile', 'last_name', e.target.value)}
            />
            <input
              type="text"
              placeholder="USN"
              value={formData.usn}
              onChange={(e) => handleInputChange('profile', 'usn', e.target.value)}
            />
            <input
              type="date"
              placeholder="Date of Birth"
              value={formData.dob}
              onChange={(e) => handleInputChange('profile', 'dob', e.target.value)}
            />
            <input
              type="tel"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={(e) => handleInputChange('profile', 'phone', e.target.value)}
            />
          </div>
        );

      case 2:
        return (
          <div className="form-step">
            <h3>Parent Information</h3>
            <input
              type="text"
              placeholder="Father's Name"
              value={formData.father_name}
              onChange={(e) => handleInputChange('parent', 'father_name', e.target.value)}
            />
            <input
              type="text"
              placeholder="Mother's Name"
              value={formData.mother_name}
              onChange={(e) => handleInputChange('parent', 'mother_name', e.target.value)}
            />
            <input
              type="tel"
              placeholder="Parent Contact"
              value={formData.parent_contact}
              onChange={(e) => handleInputChange('parent', 'parent_contact', e.target.value)}
            />
            <input
              type="email"
              placeholder="Parent Email"
              value={formData.parent_email}
              onChange={(e) => handleInputChange('parent', 'parent_email', e.target.value)}
            />
          </div>
        );

      case 3:
        return (
          <div className="form-step">
            <h3>Address Information</h3>
            <div className="address-section">
              <h4>Permanent Address</h4>
              <input
                type="text"
                placeholder="Street"
                value={formData.permanent_address.street}
                onChange={(e) => handleInputChange('address', 'permanent_address', { street: e.target.value })}
              />
              <input
                type="text"
                placeholder="City"
                value={formData.permanent_address.city}
                onChange={(e) => handleInputChange('address', 'permanent_address', { city: e.target.value })}
              />
              <input
                type="text"
                placeholder="State"
                value={formData.permanent_address.state}
                onChange={(e) => handleInputChange('address', 'permanent_address', { state: e.target.value })}
              />
              <input
                type="text"
                placeholder="ZIP Code"
                value={formData.permanent_address.zip_code}
                onChange={(e) => handleInputChange('address', 'permanent_address', { zip_code: e.target.value })}
              />
              <input
                type="text"
                placeholder="Country"
                value={formData.permanent_address.country}
                onChange={(e) => handleInputChange('address', 'permanent_address', { country: e.target.value })}
              />
            </div>

            <div className="address-section">
              <h4>Temporary Address</h4>
              <input
                type="text"
                placeholder="Street"
                value={formData.temporary_address.street}
                onChange={(e) => handleInputChange('address', 'temporary_address', { street: e.target.value })}
              />
              <input
                type="text"
                placeholder="City"
                value={formData.temporary_address.city}
                onChange={(e) => handleInputChange('address', 'temporary_address', { city: e.target.value })}
              />
              <input
                type="text"
                placeholder="State"
                value={formData.temporary_address.state}
                onChange={(e) => handleInputChange('address', 'temporary_address', { state: e.target.value })}
              />
              <input
                type="text"
                placeholder="ZIP Code"
                value={formData.temporary_address.zip_code}
                onChange={(e) => handleInputChange('address', 'temporary_address', { zip_code: e.target.value })}
              />
              <input
                type="text"
                placeholder="Country"
                value={formData.temporary_address.country}
                onChange={(e) => handleInputChange('address', 'temporary_address', { country: e.target.value })}
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="form-step">
            <h3>Academic Records</h3>
            {formData.academic_records.map((record, index) => (
              <div key={index} className="academic-record">
                <span>{record.semester}</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  placeholder="GPA"
                  value={record.gpa}
                  onChange={(e) => handleInputChange('academic_records', 'gpa', e.target.value, index)}
                />
              </div>
            ))}
          </div>
        );

      case 5:
        return (
          <div className="form-step">
            <h3>Sibling Information</h3>
            {formData.siblings.map((sibling, index) => (
              <div key={index} className="sibling-info">
                <input
                  type="text"
                  placeholder="Sibling Name"
                  value={sibling.sibling_name}
                  onChange={(e) => handleInputChange('siblings', 'sibling_name', e.target.value, index)}
                />
                <input
                  type="text"
                  placeholder="Relationship"
                  value={sibling.relationship}
                  onChange={(e) => handleInputChange('siblings', 'relationship', e.target.value, index)}
                />
                {index > 0 && (
                  <button type="button" onClick={() => removeArrayField('siblings', index)}>
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={() => addArrayField('siblings')}>
              Add Sibling
            </button>
          </div>
        );

      case 6:
        return (
          <div className="form-step">
            <h3>Hobbies</h3>
            {formData.hobbies.map((hobby, index) => (
              <div key={index} className="hobby-input">
                <input
                  type="text"
                  placeholder="Hobby"
                  value={hobby}
                  onChange={(e) => handleInputChange('hobbies', null, e.target.value, index)}
                />
                {index > 0 && (
                  <button type="button" onClick={() => removeArrayField('hobbies', index)}>
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={() => addArrayField('hobbies')}>
              Add Hobby
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="profile-container">
      <Header userType="student" />
      <main className="profile-content">
        <div className="profile-form">
          <h2>Complete Your Profile</h2>
          {error && <p className="error-message">{error}</p>}
          
          <div className="step-indicator">
            Step {currentStep} of 6
          </div>

          {renderStep()}

          <div className="form-navigation">
            {currentStep > 1 && (
              <button type="button" onClick={() => setCurrentStep(prev => prev - 1)}>
                Previous
              </button>
            )}
            {currentStep < 6 ? (
              <button type="button" onClick={() => setCurrentStep(prev => prev + 1)}>
                Next
              </button>
            ) : (
              <button 
                type="button" 
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Submit Profile'}
              </button>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default StudentProfile;
