import React from 'react';
import Header from './Header';
import Footer from './Footer';
import './TimeTable.css';

const TimeTable = () => {
  // Sample timetable data
  const timetableData = {
    Monday: [
      { time: '8:00 - 9:00', subject: 'Mathematics' },
      { time: '9:00 - 10:00', subject: 'Physics' },
      { time: '10:00 - 10:20', subject: 'Break' },
      { time: '10:20 - 11:20', subject: 'Chemistry' },
      { time: '11:20 - 12:20', subject: 'English' },
      { time: '12:20 - 1:00', subject: 'Lunch' },
      { time: '1:00 - 2:00', subject: 'Computer Science' },
      { time: '2:00 - 3:00', subject: 'Biology' },
      { time: '3:00 - 4:00', subject: 'History' }
    ],
    Tuesday: [
      { time: '8:00 - 9:00', subject: 'Physics' },
      { time: '9:00 - 10:00', subject: 'Mathematics' },
      { time: '10:00 - 10:20', subject: 'Break' },
      { time: '10:20 - 11:20', subject: 'Biology' },
      { time: '11:20 - 12:20', subject: 'Chemistry' },
      { time: '12:20 - 1:00', subject: 'Lunch' },
      { time: '1:00 - 2:00', subject: 'English' },
      { time: '2:00 - 3:00', subject: 'Computer Science' },
      { time: '3:00 - 4:00', subject: 'Geography' }
    ],
    // Add similar data for other days
  };

  const timeSlots = [
    '8:00 - 9:00',
    '9:00 - 10:00',
    '10:00 - 10:20',
    '10:20 - 11:20',
    '11:20 - 12:20',
    '12:20 - 1:00',
    '1:00 - 2:00',
    '2:00 - 3:00',
    '3:00 - 4:00'
  ];

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div className="page-container">
      <Header userType="student" />
      <div className="timetable-container">
        <h2 className="timetable-title">Class Timetable</h2>
        
        <div className="timetable">
          <div className="timetable-header">
            <div className="day-column">Day/Time</div>
            {timeSlots.map(time => (
              <div key={time} className="time-column">{time}</div>
            ))}
          </div>
          
          <div className="timetable-body">
            {days.map(day => (
              <div key={day} className="day-row">
                <div className="day-name">{day}</div>
                {timeSlots.map((time, index) => {
                  const isBreak = time === '10:00 - 10:20';
                  const isLunch = time === '12:20 - 1:00';
                  return (
                    <div 
                      key={time} 
                      className={`subject-cell ${isBreak ? 'break-cell' : ''} ${isLunch ? 'lunch-cell' : ''}`}
                    >
                      {isBreak ? 'Break' : 
                       isLunch ? 'Lunch' : 
                       timetableData[day]?.[index]?.subject || '-'}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TimeTable;