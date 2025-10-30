import { useState } from 'react';

const API_BASE = 'http://localhost:3000/api';

function EventList({ events, user, token, myRsvps, onEventDeleted, onEventApproved, onRsvpUpdated }) {
  const [message, setMessage] = useState('');

  const handleDelete = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;

    try {
      const response = await fetch(`${API_BASE}/events/${eventId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setMessage('Event deleted successfully');
        onEventDeleted();
        setTimeout(() => setMessage(''), 3000);
      } else {
        const data = await response.json();
        setMessage(data.error || 'Failed to delete event');
      }
    } catch (error) {
      setMessage('Network error');
    }
  };

  const handleApprove = async (eventId) => {
    try {
      const response = await fetch(`${API_BASE}/events/${eventId}/approve`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setMessage('✅ Event approved!');
        onEventApproved();
        setTimeout(() => setMessage(''), 3000);
      } else {
        const data = await response.json();
        setMessage(data.error || 'Failed to approve event');
      }
    } catch (error) {
      setMessage('Network error');
    }
  };

  const handleRSVP = async (eventId, status) => {
    try {
      const response = await fetch(`${API_BASE}/events/${eventId}/rsvp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        setMessage(`RSVP updated: ${status}`);
        onRsvpUpdated();
        setTimeout(() => setMessage(''), 2000);
      } else {
        const data = await response.json();
        setMessage(data.error || 'Failed to RSVP');
      }
    } catch (error) {
      setMessage('Network error');
    }
  };

  const getUserRsvp = (eventId) => {
    return myRsvps.find(r => r.eventId === eventId);
  };

  return (
    <div className="card">
      <h3>📅 Events</h3>
      
      {message && (
        <div className={`message ${message.includes('✅') || message.includes('updated') ? 'success' : message.includes('deleted') ? 'info' : 'error'}`}>
          {message}
        </div>
      )}

      {events.length === 0 ? (
        <p className="empty-state">No events available</p>
      ) : (
        <div className="events-list">
          {events.map(event => {
            const isOrganizer = user.id === event.organizerId;
            const isAdmin = user.role === 'ADMIN';
            const canManage = isOrganizer || isAdmin;
            const userRsvp = getUserRsvp(event.id);

            return (
              <div key={event.id} className="event-card">
                <div className="event-header">
                  <h4>{event.title}</h4>
                  <span className={`event-status ${event.approved ? 'approved' : 'pending'}`}>
                    {event.approved ? '✓ Approved' : '⏳ Pending'}
                  </span>
                </div>

                <div className="event-info">
                  <p><strong>📝 Description:</strong> {event.description}</p>
                  <p><strong>📅 Date:</strong> {new Date(event.date).toLocaleString()}</p>
                  <p><strong>📍 Location:</strong> {event.location}</p>
                  <p><strong>👤 Organizer:</strong> {event.organizer?.email || 'Unknown'}</p>
                </div>

                {event.approved && (
                  <div className="rsvp-section">
                    <strong>Your RSVP:</strong>
                    <div className="rsvp-buttons">
                      <button
                        className={`rsvp-btn ${userRsvp?.status === 'GOING' ? 'selected' : ''}`}
                        onClick={() => handleRSVP(event.id, 'GOING')}
                      >
                        ✓ Going
                      </button>
                      <button
                        className={`rsvp-btn ${userRsvp?.status === 'MAYBE' ? 'selected' : ''}`}
                        onClick={() => handleRSVP(event.id, 'MAYBE')}
                      >
                        ? Maybe
                      </button>
                      <button
                        className={`rsvp-btn ${userRsvp?.status === 'NOT_GOING' ? 'selected' : ''}`}
                        onClick={() => handleRSVP(event.id, 'NOT_GOING')}
                      >
                        ✗ Not Going
                      </button>
                    </div>
                  </div>
                )}

                <div className="event-actions">
                  {!event.approved && isAdmin && (
                    <button
                      className="btn btn-success"
                      onClick={() => handleApprove(event.id)}
                    >
                      ✓ Approve Event
                    </button>
                  )}
                  {canManage && (
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDelete(event.id)}
                    >
                      🗑️ Delete
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default EventList;
