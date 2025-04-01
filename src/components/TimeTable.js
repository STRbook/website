import React, { useState, useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import { Container } from '@mui/material';
import './TimeTable.css';
import Announcements from './Announcements';

const TimeTable = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedSemester, setSelectedSemester] = useState('5');
  const [selectedSection, setSelectedSection] = useState('C');

  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const timetableData = {
    "1": {
      "A": {
        "Monday": [
          { time: '8:00 - 9:00', subject: 'Mathematics', teacher: 'Dr. Smith', room: '101' },
          { time: '9:00 - 10:00', subject: 'Physics', teacher: 'Prof. Johnson', room: '102' },
          { time: '10:00 - 10:20', subject: 'Break', type: 'break' },
          { time: '10:20 - 11:20', subject: 'Chemistry', teacher: 'Dr. Williams', room: '103' },
          { time: '11:20 - 12:20', subject: 'English', teacher: 'Ms. Brown', room: '104' },
          { time: '12:20 - 1:00', subject: 'Lunch', type: 'lunch' },
          { time: '1:00 - 2:00', subject: 'Computer Science', teacher: 'Prof. Davis', room: '105', lab: true },
          { time: '2:00 - 3:00', subject: 'Biology', teacher: 'Dr. Miller', room: '106' },
          { time: '3:00 - 4:00', subject: 'History', teacher: 'Mr. Wilson', room: '107' }
        ],
        "Tuesday": [
          { time: '8:00 - 9:00', subject: 'Physics', teacher: 'Prof. Johnson', room: '102' },
          { time: '9:00 - 10:00', subject: 'Mathematics', teacher: 'Dr. Smith', room: '101' },
          { time: '10:00 - 10:20', subject: 'Break', type: 'break' },
          { time: '10:20 - 11:20', subject: 'Biology', teacher: 'Dr. Miller', room: '106' },
          { time: '11:20 - 12:20', subject: 'Chemistry', teacher: 'Dr. Williams', room: '103' },
          { time: '12:20 - 1:00', subject: 'Lunch', type: 'lunch' },
          { time: '1:00 - 2:00', subject: 'English', teacher: 'Ms. Brown', room: '104' },
          { time: '2:00 - 3:00', subject: 'Computer Science Lab', teacher: 'Prof. Davis', room: 'Lab 1', lab: true },
          { time: '3:00 - 4:00', subject: 'Geography', teacher: 'Mrs. Taylor', room: '108' }
        ],
        
      }
    },
    "5": {
      "C": {
        "timetable": [
          {
            "day": "Monday",
            "slots": [
              {"time": "08:00 - 09:00 AM", "subject": "Technical Training"},
              {"time": "09:00 - 10:00 AM", "subject": "Technical Training"},
              {"time": "10:00 - 10:20 AM", "subject": "Break"},
              {"time": "10:20 - 11:20 AM", "subject": "AI"},
              {"time": "11:20 - 12:20 PM", "subject": "SE"},
              {"time": "12:20 - 01:00 PM", "subject": "Lunch Break"},
              {"time": "01:00 - 02:00 PM", "subject": "SE"},
              {"time": "02:00 - 03:00 PM", "subject": "TOC"},
              {"time": "03:00 - 04:00 PM", "subject": "TYL SS"}
            ]
          },
          {
            "day": "Tuesday",
            "slots": [
              {"time": "08:00 - 09:00 AM", "subject": "SE"},
              {"time": "09:00 - 10:00 AM", "subject": "AI"},
              {"time": "10:00 - 10:20 AM", "subject": "Break"},
              {"time": "10:20 - 11:20 AM", "subject": "CN"},
              {"time": "11:20 - 12:20 PM", "subject": "TOC"},
              {"time": "12:20 - 01:00 PM", "subject": "Lunch Break"},
              {"time": "01:00 - 02:00 PM", "subject": "CN"},
              {"time": "02:00 - 03:00 PM", "subject": "TYL SS"},
              {"time": "03:00 - 04:00 PM", "subject": "MAD"}
            ]
          },
          {
            "day": "Wednesday",
            "slots": [
              {"time": "08:00 - 09:00 AM", "subject": "TYL APTI"},
              {"time": "09:00 - 10:00 AM", "subject": "MAD"},
              {"time": "10:00 - 10:20 AM", "subject": "Break"},
              {"time": "10:20 - 11:20 AM", "subject": "EVS"},
              {"time": "11:20 - 12:20 PM", "subject": "MAD"},
              {"time": "12:20 - 01:00 PM", "subject": "Lunch Break"},
              {"time": "01:00 - 02:00 PM", "subject": "SE"},
              {"time": "02:00 - 03:00 PM", "subject": "Club Activity"},
              {"time": "03:00 - 04:00 PM", "subject": "Mini Projects"}
            ]
          },
          {
            "day": "Thursday",
            "slots": [
              {"time": "08:00 - 09:00 AM", "subject": "CN"},
              {"time": "09:00 - 10:00 AM", "subject": "AI"},
              {"time": "10:00 - 10:20 AM", "subject": "Break"},
              {"time": "10:20 - 11:20 AM", "subject": "C1 - CN, C2 - CN, C3 - DV Lab"},
              {"time": "11:20 - 12:20 PM", "subject": "C1 - CN, C2 - CN, C3 - DV Lab"},
              {"time": "12:20 - 01:00 PM", "subject": "Lunch Break"},
              {"time": "01:00 - 02:00 PM", "subject": "SE"},
              {"time": "02:00 - 03:00 PM", "subject": "TOC"},
              {"time": "03:00 - 04:00 PM", "subject": "C1 - DV, C2 - DV, C3 - CN Lab"}
            ]
          },
          {
            "day": "Friday",
            "slots": [
              {"time": "08:00 - 09:00 AM", "subject": "TOC"},
              {"time": "09:00 - 10:00 AM", "subject": "MAD"},
              {"time": "10:00 - 10:20 AM", "subject": "Break"},
              {"time": "10:20 - 11:20 AM", "subject": "TYL APTI"},
              {"time": "11:20 - 12:20 PM", "subject": "RM"},
              {"time": "12:20 - 01:00 PM", "subject": "Lunch Break"},
              {"time": "01:00 - 02:00 PM", "subject": "TOC"},
              {"time": "02:00 - 03:00 PM", "subject": "AI"},
              {"time": "03:00 - 04:00 PM", "subject": "EVS"}
            ]
          },
          {
            "day": "Saturday",
            "slots": [
              {"time": "08:00 - 09:00 AM", "subject": "RM"},
              {"time": "09:00 - 10:00 AM", "subject": "AI"},
              {"time": "10:00 - 10:20 AM", "subject": "Break"},
              {"time": "10:20 - 11:20 AM", "subject": "SE"},
              {"time": "11:20 - 12:20 PM", "subject": "TOC"},
              {"time": "12:20 - 01:00 PM", "subject": "Lunch Break"},
              {"time": "01:00 - 02:00 PM", "subject": "Mini Projects"},
              {"time": "02:00 - 03:00 PM", "subject": "C1 - DV, C2 - DV, C3 - CN Lab"},
              {"time": "03:00 - 04:00 PM", "subject": "C1 - DV, C2 - DV, C3 - CN Lab"}
            ]
          }
        ]
      }
    }
  };

  const getCurrentClass = () => {
    const currentDay = currentTime.toLocaleDateString('en-US', { weekday: 'long' });
    const currentHour = currentTime.getHours();
    const currentMinute = currentTime.getMinutes();
    const currentTimeString = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;

    const daySchedule = timetableData[selectedSemester]?.[selectedSection]?.timetable.find(
      day => day.day === currentDay
    );

    if (!daySchedule) return null;

    const currentSlot = daySchedule.slots.find(slot => {
      const [startTime] = slot.time.split(' - ');
      const [endTime] = slot.time.split(' - ')[1].split(' ');
      
      const [startHour, startMinute] = startTime.split(':');
      const [endHour, endMinute] = endTime.split(':');
      
      const start = `${startHour.padStart(2, '0')}:${startMinute}`;
      const end = `${endHour.padStart(2, '0')}:${endMinute}`;
      
      return currentTimeString >= start && currentTimeString <= end;
    });

    return currentSlot;
  };

  const currentClass = getCurrentClass();

  const getClassType = (subject) => {
    if (subject.toLowerCase().includes('lab')) return 'lab-cell';
    if (subject.toLowerCase().includes('lunch')) return 'lunch-cell';
    if (subject.toLowerCase().includes('break')) return 'break-cell';
    return '';
  };

  return (
    <div className="page-container">
      <Header userType="student" />
      <div className="timetable-container">
        <div className="timetable-header-controls">
          <h1 className="timetable-title">Class Timetable</h1>
          <div className="controls">
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
            >
              <option value="1">Semester 1</option>
              <option value="5">Semester 5</option>
            </select>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
            >
              <option value="A">Section A</option>
              <option value="C">Section C</option>
            </select>
          </div>
        </div>

        {currentClass && (
          <div className="current-class-info">
            <div className="current-time">
              {currentTime.toLocaleTimeString('en-US', { 
                hour: '2-digit',
                minute: '2-digit',
                hour12: true 
              })}
            </div>
            <div className="current-subject">
              <h3>Current Class</h3>
              <p className="subject-name">{currentClass.subject}</p>
              <p>{currentClass.time}</p>
            </div>
          </div>
        )}

        {selectedSemester === '1' && (
          <div className="timetable">
            <div className="timetable-header">
              <div className="day-column">Day/Time</div>
              {['8:00 - 9:00', '9:00 - 10:00', '10:00 - 10:20', '10:20 - 11:20', '11:20 - 12:20', '12:20 - 1:00', '1:00 - 2:00', '2:00 - 3:00', '3:00 - 4:00'].map(time => (
                <div key={time} className="time-column">{time}</div>
              ))}
            </div>
            
            <div className="timetable-body">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
                <div key={day} className="day-row">
                  <div className="day-name">{day}</div>
                  {['8:00 - 9:00', '9:00 - 10:00', '10:00 - 10:20', '10:20 - 11:20', '11:20 - 12:20', '12:20 - 1:00', '1:00 - 2:00', '2:00 - 3:00', '3:00 - 4:00'].map((time, index) => {
                    const slot = timetableData[selectedSemester]?.[selectedSection]?.[day]?.[index] || {};
                    const isBreak = slot.type === 'break';
                    const isLunch = slot.type === 'lunch';
                    const isLab = slot.lab;
                    
                    return (
                      <div 
                        key={time} 
                        className={`subject-cell ${isBreak ? 'break-cell' : ''} ${isLunch ? 'lunch-cell' : ''} ${isLab ? 'lab-cell' : ''}`}
                      >
                        {slot.subject && (
                          <div className="subject-info">
                            <div className="subject-name">{slot.subject}</div>
                            {!isBreak && !isLunch && (
                              <>
                                <div className="teacher-name">{slot.teacher}</div>
                                <div className="room-number">{slot.room}</div>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedSemester === '5' && (
          <div className="timetable">
            <div className="timetable-header">
              <div className="time-column">Time</div>
              {timetableData[selectedSemester]?.[selectedSection]?.timetable[0].slots.map((slot, index) => (
                <div key={index} className="day-column">{slot.time}</div>
              ))}
            </div>
            <div className="timetable-body">
              {timetableData[selectedSemester]?.[selectedSection]?.timetable.map((day, dayIndex) => (
                <div key={dayIndex} className="day-row">
                  <div className="day-name">{day.day}</div>
                  {day.slots.map((slot, slotIndex) => (
                    <div
                      key={slotIndex}
                      className={`subject-cell ${getClassType(slot.subject)}`}
                    >
                      <div className="subject-info">
                        <span className="subject-name">{slot.subject}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
        <Container maxWidth="lg">
        </Container>
      </div>
      <>
        <Announcements />
        <Footer />
      </>
    </div>
  );
};

export default TimeTable;
