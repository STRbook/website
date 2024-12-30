import React, { useState } from 'react';
import Header from './Header';
import Footer from './Footer';
import './styles/VTUCalculator.css';

const VTUCalculator = () => {
  const [subjects, setSubjects] = useState([
    { credits: 4, marks: '', name: '' },
    { credits: 4, marks: '', name: '' },
    { credits: 4, marks: '', name: '' },
    { credits: 3, marks: '', name: '' },
    { credits: 3, marks: '', name: '' },
    { credits: 3, marks: '', name: '' },
    { credits: 2, marks: '', name: '' },
    { credits: 2, marks: '', name: '' }
  ]);
  const [gpa, setGpa] = useState(null);

  const handleChange = (index, field, value) => {
    const newSubjects = [...subjects];
    if (field === 'credits') {
      value = Math.min(Math.max(parseInt(value) || 1, 1), 4);
    }
    if (field === 'marks') {
      value = Math.min(Math.max(parseInt(value) || 0, 0), 100);
    }
    newSubjects[index][field] = value;
    setSubjects(newSubjects);
  };

  const addSubject = () => {
    setSubjects([...subjects, { credits: 4, marks: '', name: '' }]);
  };

  const removeSubject = (index) => {
    if (subjects.length > 1) {
      const newSubjects = subjects.filter((_, i) => i !== index);
      setSubjects(newSubjects);
    }
  };

  const calculateGrade = (marks) => {
    if (marks >= 90) return 10;
    if (marks >= 80) return 9;
    if (marks >= 70) return 8;
    if (marks >= 60) return 7;
    if (marks >= 50) return 6;
    if (marks >= 45) return 5;
    if (marks >= 40) return 4;
    return 0;
  };

  const calculateGPA = () => {
    let totalCredits = 0;
    let totalPoints = 0;

    for (const subject of subjects) {
      if (!subject.credits || !subject.marks) {
        alert('Please fill all fields');
        return;
      }
      totalCredits += parseInt(subject.credits);
      totalPoints += parseInt(subject.credits) * calculateGrade(subject.marks);
    }

    const calculatedGPA = (totalPoints / totalCredits).toFixed(2);
    setGpa(calculatedGPA);
  };

  return (
    <div className="calculator-container">
      <Header userType="student" />
      <div className="calculator-content">
        <h2>VTU SGPA Calculator</h2>
        <div className="subjects-container">
          {subjects.map((subject, index) => (
            <div key={index} className="subject-row">
              <input
                type="text"
                value={subject.name}
                onChange={(e) => handleChange(index, 'name', e.target.value)}
                placeholder="Enter Subject"
                className="subject-input"
              />
              <input
                type="number"
                value={subject.credits}
                onChange={(e) => handleChange(index, 'credits', e.target.value)}
                placeholder="Credits"
                min="1"
                max="4"
                className="credits-input"
              />
              <input
                type="number"
                value={subject.marks}
                onChange={(e) => handleChange(index, 'marks', e.target.value)}
                placeholder="Enter Marks"
                min="0"
                max="100"
                className="marks-input"
              />
              <button 
                className="remove-btn"
                onClick={() => removeSubject(index)}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <div className="calculator-actions">
          <button onClick={addSubject} className="add-btn">Add Subject</button>
          <button onClick={calculateGPA} className="calculate-btn">Calculate SGPA</button>
        </div>
        {gpa && (
          <div className="gpa-result">
            Your SGPA: <span>{gpa}</span>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default VTUCalculator;
