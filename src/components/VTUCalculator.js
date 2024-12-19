import React, { useState } from 'react';
import Header from './Header';
import Footer from './Footer';
import './styles/VTUCalculator.css';

const VTUCalculator = () => {
  const [subjects, setSubjects] = useState([
    { credits: 4, grade: '', name: 'Subject 1' }
  ]);
  const [gpa, setGpa] = useState(null);

  const gradePoints = {
    'O': 10,
    'A': 9,
    'B': 8,
    'C': 7,
    'D': 6,
    'E': 4,
    'F': 0
  };

  const addSubject = () => {
    setSubjects([...subjects, { 
      credits: 4, 
      grade: '', 
      name: `Subject ${subjects.length + 1}` 
    }]);
  };

  const removeSubject = (index) => {
    const newSubjects = subjects.filter((_, i) => i !== index);
    setSubjects(newSubjects);
  };

  const handleChange = (index, field, value) => {
    const newSubjects = [...subjects];
    newSubjects[index][field] = value;
    setSubjects(newSubjects);
  };

  const calculateGPA = () => {
    let totalCredits = 0;
    let totalPoints = 0;

    for (const subject of subjects) {
      if (!subject.credits || !subject.grade) {
        alert('Please fill all fields');
        return;
      }
      totalCredits += parseInt(subject.credits);
      totalPoints += parseInt(subject.credits) * gradePoints[subject.grade];
    }

    const calculatedGPA = (totalPoints / totalCredits).toFixed(2);
    setGpa(calculatedGPA);
  };

  return (
    <div className="calculator-container">
      <Header userType="student" />
      <div className="calculator-content">
        <h2>VTU GPA Calculator</h2>
        <div className="subjects-container">
          {subjects.map((subject, index) => (
            <div key={index} className="subject-row">
              <input
                type="text"
                value={subject.name}
                onChange={(e) => handleChange(index, 'name', e.target.value)}
                placeholder="Subject Name"
              />
              <input
                type="number"
                value={subject.credits}
                onChange={(e) => handleChange(index, 'credits', e.target.value)}
                placeholder="Credits"
                min="1"
                max="4"
              />
              <select
                value={subject.grade}
                onChange={(e) => handleChange(index, 'grade', e.target.value)}
              >
                <option value="">Select Grade</option>
                {Object.keys(gradePoints).map(grade => (
                  <option key={grade} value={grade}>{grade}</option>
                ))}
              </select>
              {subjects.length > 1 && (
                <button 
                  className="remove-btn"
                  onClick={() => removeSubject(index)}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
        <div className="calculator-actions">
          <button onClick={addSubject}>Add Subject</button>
          <button onClick={calculateGPA}>Calculate GPA</button>
        </div>
        {gpa && (
          <div className="gpa-result">
            Your GPA: <span>{gpa}</span>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default VTUCalculator;
