// src/components/StudentProfile.js

import React, { useEffect, useState } from 'react';
import Header from './Header';
import Footer from './Footer';
import './styles/Profile.css'; // Add styling here or reuse Dashboard CSS

const StudentProfile = () => {
  useEffect(() => {
    document.title = "Student Profile";
  }, []);

  // Placeholder state, this would eventually come from your backend/database.
  const [studentInfo, setStudentInfo] = useState({
    personalInfo: {
      name: 'John Doe',
      usn: '1CR22IS101',
      dob: '2001-05-12',
      phone: '9876543210',
      email: 'johndoe@example.com',
    },
    parentInfo: {
      fatherName: 'Mr. Doe',
      motherName: 'Mrs. Doe',
      contact: '9876543210',
      email: 'parentdoe@example.com'
    },
    address: {
      permanent: {
        street: '123 Main St',
        city: 'New York',
        zip_code: '10001',
        state: 'NY',
        country: 'USA',
      },
      temporary: {
        street: '45 Oak St',
        city: 'New York',
        zip_code: '10002',
        state: 'NY',
        country: 'USA',
      },
    },
    academics: [
      { semester: 'Semester 1', gpa: 8.5 },
      { semester: 'Semester 2', gpa: 9.0 },
    ],
    siblingInfo: [
      { siblingName: 'Jane Doe', relationship: 'Sister' },
    ],
    hobbies: ['Reading', 'Coding', 'Basketball']
  });

  // Once integrated, you'd fetch data from your backend and set it here.
  useEffect(() => {
    // Example: fetch data from API
    // fetch('api/student-profile').then(response => response.json()).then(data => setStudentInfo(data));
  }, []);

  return (
    <div className="profile-container">
      <Header userType="student" />
      <main className="profile-content">
        <h2>Student Profile</h2>

        {/* Personal Information */}
        <section className="personal-info">
          <h3>Personal Information</h3>
          <p><strong>Name:</strong> {studentInfo.personalInfo.name}</p>
          <p><strong>USN:</strong> {studentInfo.personalInfo.usn}</p>
          <p><strong>Date of Birth:</strong> {studentInfo.personalInfo.dob}</p>
          <p><strong>Phone:</strong> {studentInfo.personalInfo.phone}</p>
          <p><strong>Email:</strong> {studentInfo.personalInfo.email}</p>
        </section>

        {/* Parents Information */}
        <section className="parent-info">
          <h3>Parents Information</h3>
          <p><strong>Father's Name:</strong> {studentInfo.parentInfo.fatherName}</p>
          <p><strong>Mother's Name:</strong> {studentInfo.parentInfo.motherName}</p>
          <p><strong>Parents' Contact:</strong> {studentInfo.parentInfo.contact}</p>
          <p><strong>Parents' Email:</strong> {studentInfo.parentInfo.email}</p>
        </section>

        {/* Address Information */}
        <section className="address-info">
          <h3>Address</h3>
          <div>
            <h4>Permanent Address</h4>
            <p>{studentInfo.address.permanent.street}, {studentInfo.address.permanent.city}, {studentInfo.address.permanent.state}, {studentInfo.address.permanent.zip_code}, {studentInfo.address.permanent.country}</p>
          </div>
          <div>
            <h4>Temporary Address</h4>
            <p>{studentInfo.address.temporary.street}, {studentInfo.address.temporary.city}, {studentInfo.address.temporary.state}, {studentInfo.address.temporary.zip_code}, {studentInfo.address.temporary.country}</p>
          </div>
        </section>

        {/* Academic Information */}
        <section className="academics-info">
          <h3>Academic Records</h3>
          <table className="academics-table">
            <thead>
              <tr>
                <th>Semester</th>
                <th>GPA</th>
              </tr>
            </thead>
            <tbody>
              {studentInfo.academics.map((record, index) => (
                <tr key={index}>
                  <td>{record.semester}</td>
                  <td>{record.gpa}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Sibling Information */}
        <section className="sibling-info">
          <h3>Sibling Information</h3>
          {studentInfo.siblingInfo.length > 0 ? (
            studentInfo.siblingInfo.map((sibling, index) => (
              <p key={index}><strong>Name:</strong> {sibling.siblingName}, <strong>Relationship:</strong> {sibling.relationship}</p>
            ))
          ) : (
            <p>No siblings listed.</p>
          )}
        </section>

        {/* Hobbies */}
        <section className="hobbies-info">
          <h3>Hobbies</h3>
          <ul>
            {studentInfo.hobbies.map((hobby, index) => (
              <li key={index}>{hobby}</li>
            ))}
          </ul>
        </section>

      </main>
      <Footer />
    </div>
  );
};

export default StudentProfile;
