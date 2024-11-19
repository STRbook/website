import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../config/api';
import Header from './Header';
import Footer from './Footer';
import './styles/StudentProfile.css';
import useStorage from '../hooks/useStorage';

const StudentProfile = () => {
  const navigate = useNavigate();
  const { progress, error: uploadError, uploadFile } = useStorage();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    dob: '',
    gender: '',
    phone: '',
    email: '',
    current_address: {
      street: '',
      city: '',
      state: '',
      postal_code: '',
      country: ''
    },
    permanent_address: {
      street: '',
      city: '',
      state: '',
      postal_code: '',
      country: ''
    },
    parent_info: {
      father_name: '',
      mother_name: '',
      contact: '',
      email: ''
    },
    academic_records: [
      {
        degree: '',
        institution: '',
        year: '',
        grade: ''
      }
    ],
    hobbies: [],
    profile_picture_url: ''
  });

  const [previewUrl, setPreviewUrl] = useState(null);

  const handleInputChange = (e, section = null, index = null) => {
    const { name, value } = e.target;
    
    if (section) {
      if (index !== null) {
        setFormData(prev => ({
          ...prev,
          [section]: prev[section].map((item, i) => 
            i === index ? { ...item, [name]: value } : item
          )
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [section]: { ...prev[section], [name]: value }
        }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const addAcademicRecord = () => {
    setFormData(prev => ({
      ...prev,
      academic_records: [
        ...prev.academic_records,
        { degree: '', institution: '', year: '', grade: '' }
      ]
    }));
  };

  const removeAcademicRecord = (index) => {
    setFormData(prev => ({
      ...prev,
      academic_records: prev.academic_records.filter((_, i) => i !== index)
    }));
  };

  const addHobby = () => {
    const hobby = document.getElementById('hobby-input').value.trim();
    if (hobby) {
      setFormData(prev => ({
        ...prev,
        hobbies: [...prev.hobbies, { hobby_name: hobby }]
      }));
      document.getElementById('hobby-input').value = '';
    }
  };

  const removeHobby = (index) => {
    setFormData(prev => ({
      ...prev,
      hobbies: prev.hobbies.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const errors = [];

    // Personal Information
    if (!formData.first_name?.trim()) errors.push('First name is required');
    if (!formData.last_name?.trim()) errors.push('Last name is required');
    if (!formData.dob) errors.push('Date of birth is required');
    if (!formData.phone?.trim()) errors.push('Phone number is required');
    if (!formData.email?.trim()) errors.push('Email is required');
    
    // Email validation (both student and parent)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      errors.push('Please enter a valid email address');
    }
    
    // Phone validation with international format support
    const phoneRegex = /^\+?[\d\s-]{10,}$/;
    if (formData.phone && !phoneRegex.test(formData.phone.trim())) {
      errors.push('Please enter a valid phone number (at least 10 digits, can include +, spaces, or hyphens)');
    }

    // Parent Information (nullable in DB, but required in form for completeness)
    if (!formData.parent_info.father_name?.trim()) errors.push('Father\'s name is required');
    if (!formData.parent_info.mother_name?.trim()) errors.push('Mother\'s name is required');
    if (!formData.parent_info.contact?.trim()) errors.push('Parent\'s contact is required');
    if (!formData.parent_info.email?.trim()) errors.push('Parent\'s email is required');
    if (formData.parent_info.email && !emailRegex.test(formData.parent_info.email)) {
      errors.push('Please enter a valid parent email address');
    }
    if (formData.parent_info.contact && !phoneRegex.test(formData.parent_info.contact.trim())) {
      errors.push('Please enter a valid parent contact number');
    }

    // Address Validation (nullable in DB, but required in form for completeness)
    const validateAddress = (address, prefix) => {
      if (!address.street?.trim()) errors.push(`${prefix} street is required`);
      if (!address.city?.trim()) errors.push(`${prefix} city is required`);
      if (!address.state?.trim()) errors.push(`${prefix} state is required`);
      if (!address.zip_code?.trim()) errors.push(`${prefix} postal code is required`);
      if (!address.country?.trim()) errors.push(`${prefix} country is required`);
    };

    validateAddress(formData.permanent_address, 'Permanent address');
    validateAddress(formData.current_address, 'Current address');

    // Academic Records (required in DB)
    if (!Array.isArray(formData.academic_records) || formData.academic_records.length === 0) {
      errors.push('At least one academic record is required');
    } else {
      formData.academic_records.forEach((record, index) => {
        if (!record.degree?.trim()) errors.push(`Degree is required for academic record ${index + 1}`);
        if (!record.institution?.trim()) errors.push(`Institution is required for academic record ${index + 1}`);
        if (!record.year) errors.push(`Year is required for academic record ${index + 1}`);
        if (!record.grade?.trim()) errors.push(`Grade is required for academic record ${index + 1}`);
        
        // Additional validation for year
        const currentYear = new Date().getFullYear();
        const year = parseInt(record.year);
        if (isNaN(year) || year < 1900 || year > currentYear + 5) {
          errors.push(`Invalid year for academic record ${index + 1}. Year must be between 1900 and ${currentYear + 5}`);
        }
      });
    }

    // Hobbies validation (optional but if present should have a name)
    if (Array.isArray(formData.hobbies)) {
      formData.hobbies.forEach((hobby, index) => {
        if (!hobby?.hobby_name?.trim()) {
          errors.push(`Hobby name is required for hobby ${index + 1}`);
        }
      });
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form before submission
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      console.error('Validation errors:', validationErrors);
      // You might want to add a state for errors and display them in the UI
      alert(validationErrors.join('\n'));
      return;
    }

    try {
      const student_id = localStorage.getItem('student_id');
      const token = localStorage.getItem('token');

      if (!student_id || !token) {
        console.error('Missing student_id or token');
        navigate('/login');
        return;
      }

      // Transform the data to match backend's expected format
      const payload = {
        studentId: student_id, // backend expects studentId, not student_id
        first_name: formData.first_name,
        last_name: formData.last_name,
        dob: formData.dob,
        phone: formData.phone,
        email: formData.email,
        profile_picture_url: formData.profile_picture_url,
        // Transform parent info
        father_name: formData.parent_info.father_name,
        mother_name: formData.parent_info.mother_name,
        parent_contact: formData.parent_info.contact,
        parent_email: formData.parent_info.email,
        // Transform addresses
        permanent_address: {
          street: formData.permanent_address.street,
          city: formData.permanent_address.city,
          state: formData.permanent_address.state,
          zip_code: formData.permanent_address.postal_code,
          country: formData.permanent_address.country
        },
        temporary_address: {
          street: formData.current_address.street,
          city: formData.current_address.city,
          state: formData.current_address.state,
          zip_code: formData.current_address.postal_code,
          country: formData.current_address.country
        },
        academic_records: formData.academic_records,
        hobbies: formData.hobbies,
        siblings: [] // Add if needed
      };

      // Log the data being sent
      console.log('Submitting profile data:', payload);

      const response = await fetch(API_ENDPOINTS.STUDENT_PROFILE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      // Try to get response data, but handle cases where response might not be JSON
      let responseData;
      try {
        responseData = await response.json();
      } catch (e) {
        responseData = { message: 'Failed to parse server response' };
      }

      console.log('Server response:', {
        status: response.status,
        data: responseData
      });

      if (response.status === 401) {
        console.error('Authentication failed - redirecting to login');
        localStorage.removeItem('token');
        localStorage.removeItem('student_id');
        navigate('/login');
        return;
      }

      if (response.ok) {
        console.log('Profile saved successfully');
        // Show success message before redirecting
        alert('Profile saved successfully!');
        navigate('/student-dashboard');
      } else {
        console.error('Failed to save profile:', {
          status: response.status,
          error: responseData
        });
        // Show error message to user
        alert(responseData.message || 'Failed to save profile. Please try again.');
      }
    } catch (error) {
      console.error('Error saving profile:', {
        message: error.message,
        error
      });
      // Show error message to user
      alert('An error occurred while saving your profile. Please try again.');
    }
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 4));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const renderPersonalInfo = () => (
    <div className="profile-form-section">
      <h2>Personal Information</h2>
      <div className="form-row">
        <div className="form-field">
          <label>First Name</label>
          <input
            type="text"
            name="first_name"
            value={formData.first_name}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-field">
          <label>Last Name</label>
          <input
            type="text"
            name="last_name"
            value={formData.last_name}
            onChange={handleInputChange}
            required
          />
        </div>
      </div>
      <div className="form-row">
        <div className="form-field">
          <label>Date of Birth</label>
          <input
            type="date"
            name="dob"
            value={formData.dob}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-field">
          <label>Gender</label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleInputChange}
            required
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>
      <div className="form-row">
        <div className="form-field">
          <label>Phone</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-field">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
        </div>
      </div>
      <div className="form-field">
        <label>Profile Picture</label>
        <div className="profile-upload-container">
          {previewUrl && (
            <div className="preview-image">
              <img src={previewUrl} alt="Profile preview" />
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={async (e) => {
              const file = e.target.files[0];
              if (file) {
                // Create preview
                const reader = new FileReader();
                reader.onloadend = () => {
                  setPreviewUrl(reader.result);
                };
                reader.readAsDataURL(file);

                // Upload to Firebase
                try {
                  const url = await uploadFile(file);
                  setFormData(prev => ({
                    ...prev,
                    profile_picture_url: url
                  }));
                } catch (err) {
                  console.error('Error uploading file:', err);
                }
              }
            }}
          />
          {progress > 0 && progress < 100 && (
            <div className="upload-progress">
              <div className="progress-bar" style={{ width: `${progress}%` }}></div>
            </div>
          )}
          {uploadError && <p className="error-message">{uploadError.message}</p>}
        </div>
      </div>
    </div>
  );

  const renderAddressInfo = () => (
    <div className="profile-form-section">
      <h2>Address Information</h2>
      
      <div className="address-block">
        <h4>Current Address</h4>
        <div className="form-row">
          <div className="form-field">
            <label>Street</label>
            <input
              type="text"
              name="street"
              value={formData.current_address.street}
              onChange={(e) => handleInputChange(e, 'current_address')}
              required
            />
          </div>
          <div className="form-field">
            <label>City</label>
            <input
              type="text"
              name="city"
              value={formData.current_address.city}
              onChange={(e) => handleInputChange(e, 'current_address')}
              required
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-field">
            <label>State</label>
            <input
              type="text"
              name="state"
              value={formData.current_address.state}
              onChange={(e) => handleInputChange(e, 'current_address')}
              required
            />
          </div>
          <div className="form-field">
            <label>Postal Code</label>
            <input
              type="text"
              name="postal_code"
              value={formData.current_address.postal_code}
              onChange={(e) => handleInputChange(e, 'current_address')}
              required
            />
          </div>
          <div className="form-field">
            <label>Country</label>
            <input
              type="text"
              name="country"
              value={formData.current_address.country}
              onChange={(e) => handleInputChange(e, 'current_address')}
              required
            />
          </div>
        </div>
      </div>

      <div className="address-block">
        <h4>Permanent Address</h4>
        <div className="form-row">
          <div className="form-field">
            <label>Street</label>
            <input
              type="text"
              name="street"
              value={formData.permanent_address.street}
              onChange={(e) => handleInputChange(e, 'permanent_address')}
              required
            />
          </div>
          <div className="form-field">
            <label>City</label>
            <input
              type="text"
              name="city"
              value={formData.permanent_address.city}
              onChange={(e) => handleInputChange(e, 'permanent_address')}
              required
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-field">
            <label>State</label>
            <input
              type="text"
              name="state"
              value={formData.permanent_address.state}
              onChange={(e) => handleInputChange(e, 'permanent_address')}
              required
            />
          </div>
          <div className="form-field">
            <label>Postal Code</label>
            <input
              type="text"
              name="postal_code"
              value={formData.permanent_address.postal_code}
              onChange={(e) => handleInputChange(e, 'permanent_address')}
              required
            />
          </div>
          <div className="form-field">
            <label>Country</label>
            <input
              type="text"
              name="country"
              value={formData.permanent_address.country}
              onChange={(e) => handleInputChange(e, 'permanent_address')}
              required
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderParentInfo = () => (
    <div className="profile-form-section">
      <h2>Parent Information</h2>
      <div className="form-row">
        <div className="form-field">
          <label>Father's Name</label>
          <input
            type="text"
            name="father_name"
            value={formData.parent_info.father_name}
            onChange={(e) => handleInputChange(e, 'parent_info')}
            required
          />
        </div>
        <div className="form-field">
          <label>Mother's Name</label>
          <input
            type="text"
            name="mother_name"
            value={formData.parent_info.mother_name}
            onChange={(e) => handleInputChange(e, 'parent_info')}
            required
          />
        </div>
      </div>
      <div className="form-row">
        <div className="form-field">
          <label>Parent's Contact</label>
          <input
            type="tel"
            name="contact"
            value={formData.parent_info.contact}
            onChange={(e) => handleInputChange(e, 'parent_info')}
            required
          />
        </div>
        <div className="form-field">
          <label>Parent's Email</label>
          <input
            type="email"
            name="email"
            value={formData.parent_info.email}
            onChange={(e) => handleInputChange(e, 'parent_info')}
            required
          />
        </div>
      </div>
    </div>
  );

  const renderAcademicInfo = () => (
    <div className="profile-form-section">
      <h2>Academic Information</h2>
      <div className="academic-records">
        {formData.academic_records.map((record, index) => (
          <div key={index} className="academic-record">
            <div className="form-row">
              <div className="form-field">
                <label>Degree</label>
                <input
                  type="text"
                  name="degree"
                  value={record.degree}
                  onChange={(e) => handleInputChange(e, 'academic_records', index)}
                  required
                />
              </div>
              <div className="form-field">
                <label>Institution</label>
                <input
                  type="text"
                  name="institution"
                  value={record.institution}
                  onChange={(e) => handleInputChange(e, 'academic_records', index)}
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-field">
                <label>Year</label>
                <input
                  type="number"
                  name="year"
                  value={record.year}
                  onChange={(e) => handleInputChange(e, 'academic_records', index)}
                  required
                />
              </div>
              <div className="form-field">
                <label>Grade</label>
                <input
                  type="text"
                  name="grade"
                  value={record.grade}
                  onChange={(e) => handleInputChange(e, 'academic_records', index)}
                  required
                />
              </div>
              {index > 0 && (
                <button
                  type="button"
                  onClick={() => removeAcademicRecord(index)}
                  className="remove-button"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        ))}
        <button type="button" onClick={addAcademicRecord} className="add-button">
          Add Academic Record
        </button>
      </div>

      <h3>Hobbies & Interests</h3>
      <div className="hobbies-container">
        <div className="hobby-input">
          <input
            type="text"
            id="hobby-input"
            placeholder="Enter a hobby"
          />
          <button type="button" onClick={addHobby} className="add-button">
            Add
          </button>
        </div>
        <div className="hobbies-list">
          {formData.hobbies.map((hobby, index) => (
            <span key={index} className="hobby-tag">
              {hobby.hobby_name}
              <button
                type="button"
                onClick={() => removeHobby(index)}
                className="remove-hobby"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return renderPersonalInfo();
      case 2:
        return renderAddressInfo();
      case 3:
        return renderParentInfo();
      case 4:
        return renderAcademicInfo();
      default:
        return null;
    }
  };

  return (
    <div className="profile-form-container">
      <Header userType="student" />
      <form onSubmit={handleSubmit} className="profile-form-content">
        <div className="step-indicator">
          Step {currentStep} of 4
        </div>
        {renderStep()}
        <div className="form-buttons">
          {currentStep > 1 && (
            <button type="button" onClick={prevStep} className="form-button prev-button">
              Previous
            </button>
          )}
          {currentStep < 4 ? (
            <button type="button" onClick={nextStep} className="form-button next-button">
              Next
            </button>
          ) : (
            <button type="submit" className="form-button submit-button">
              Submit
            </button>
          )}
        </div>
      </form>
      <Footer />
    </div>
  );
};

export default StudentProfile;
