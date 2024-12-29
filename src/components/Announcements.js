import React, { useState, useEffect } from 'react';
import './Announcements.css';

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([
    {
      id: 1,
      message: "Welcome to the new semester! Check the schedule for updates.",
      date: new Date().toISOString(),
      importance: "high",
      isRead: false
    }
  ]);

  useEffect(() => {
    // Fetch announcements data from an API or a static file
    const fetchAnnouncements = async () => {
      try {
        const response = await fetch('/path/to/announcements'); // Update with actual path
        const data = await response.json();
        setAnnouncements(data.map(announcement => ({
          ...announcement,
          isRead: false
        })));
      } catch (error) {
        console.error('Error fetching announcements:', error);
      }
    };

    fetchAnnouncements();
  }, []);

  const markAsRead = (id) => {
    setAnnouncements(prevAnnouncements =>
      prevAnnouncements.map(announcement =>
        announcement.id === id
          ? { ...announcement, isRead: true }
          : announcement
      )
    );
  };

  const getImportanceIcon = (importance) => {
    switch (importance) {
      case 'high':
        return '🔴';
      case 'medium':
        return '🟡';
      case 'low':
        return '🟢';
      default:
        return '⚪';
    }
  };

  return (
    <div className="announcements-container">
      <h2>Announcements</h2>
      <div className="announcements-list">
        {announcements.length > 0 ? (
          announcements.map((announcement) => (
            <div
              key={announcement.id}
              className={`announcement-item ${announcement.isRead ? 'read' : 'unread'}`}
              onClick={() => markAsRead(announcement.id)}
            >
              <div className="announcement-header">
                <span className="importance-indicator">
                  {getImportanceIcon(announcement.importance)}
                </span>
                <span className="announcement-date">
                  {new Date(announcement.date).toLocaleDateString()}
                </span>
              </div>
              <div className="announcement-content">
                {announcement.message}
              </div>
              {!announcement.isRead && (
                <div className="unread-indicator">New</div>
              )}
            </div>
          ))
        ) : (
          <div className="no-announcements">No announcements at the moment.</div>
        )}
      </div>
    </div>
  );
};

export default Announcements;
