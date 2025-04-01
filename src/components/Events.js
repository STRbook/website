import React, { useState, useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import './styles/Events.css';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [newEvent, setNewEvent] = useState({
    clubName: '',
    eventTitle: '',
    eventDate: '',
    description: '',
    role: '', 
    certificate: '' 
  });

  useEffect(() => {
    
    
    const storedEvents = localStorage.getItem('studentEvents');
    if (storedEvents) {
      setEvents(JSON.parse(storedEvents));
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEvent(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const eventToAdd = {
      ...newEvent,
      id: Date.now(), 
      eventDate: new Date(newEvent.eventDate).toISOString().split('T')[0]
    };

    const updatedEvents = [...events, eventToAdd];
    setEvents(updatedEvents);
    localStorage.setItem('studentEvents', JSON.stringify(updatedEvents));

    
    setNewEvent({
      clubName: '',
      eventTitle: '',
      eventDate: '',
      description: '',
      role: '',
      certificate: ''
    });
  };

  const handleDelete = (eventId) => {
    const updatedEvents = events.filter(event => event.id !== eventId);
    setEvents(updatedEvents);
    localStorage.setItem('studentEvents', JSON.stringify(updatedEvents));
  };

  return (
    <div className="events-container">
      <Header userType="student" />
      <main className="events-content">
        <h2>College Events</h2>
        
        
        <div className="add-event-section">
          <h3>Add New Event</h3>
          <form onSubmit={handleSubmit} className="event-form">
            <div className="form-group">
              <label htmlFor="clubName">Club Name</label>
              <input
                type="text"
                id="clubName"
                name="clubName"
                value={newEvent.clubName}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="eventTitle">Event Title</label>
              <input
                type="text"
                id="eventTitle"
                name="eventTitle"
                value={newEvent.eventTitle}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="eventDate">Event Date</label>
              <input
                type="date"
                id="eventDate"
                name="eventDate"
                value={newEvent.eventDate}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={newEvent.description}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="role">Your Role</label>
              <select
                id="role"
                name="role"
                value={newEvent.role}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Role</option>
                <option value="participant">Participant</option>
                <option value="organizer">Organizer</option>
                <option value="volunteer">Volunteer</option>
                <option value="coordinator">Coordinator</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="certificate">Certificate Link (Optional)</label>
              <input
                type="url"
                id="certificate"
                name="certificate"
                value={newEvent.certificate}
                onChange={handleInputChange}
                placeholder="https://..."
              />
            </div>

            <button type="submit" className="submit-btn">Add Event</button>
          </form>
        </div>

        
        <div className="events-table-section">
          <h3>Your Events</h3>
          <div className="table-responsive">
            <table className="events-table">
              <thead>
                <tr>
                  <th>Club Name</th>
                  <th>Event Title</th>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Role</th>
                  <th>Certificate</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="no-events">No events added yet</td>
                  </tr>
                ) : (
                  events.map(event => (
                    <tr key={event.id}>
                      <td>{event.clubName}</td>
                      <td>{event.eventTitle}</td>
                      <td>{event.eventDate}</td>
                      <td>{event.description}</td>
                      <td>{event.role}</td>
                      <td>
                        {event.certificate && (
                          <a
                            href={event.certificate}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="certificate-link"
                          >
                            View
                          </a>
                        )}
                      </td>
                      <td>
                        <button
                          onClick={() => handleDelete(event.id)}
                          className="delete-btn"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Events;
