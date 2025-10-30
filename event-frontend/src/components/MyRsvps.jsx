function MyRsvps({ rsvps }) {
  return (
    <div className="card">
      <h3>My RSVPs</h3>
      {rsvps.length === 0 ? (
        <p className="empty-state">No RSVPs yet</p>
      ) : (
        <div className="rsvps-list">
          {rsvps.map(rsvp => (
            <div key={rsvp.id} className="event-card">
              <div className="event-header">
                <h4>{rsvp.event.title}</h4>
                <span className="badge">{rsvp.status}</span>
              </div>
              <div className="event-info">
                <p><strong>📅 Date:</strong> {new Date(rsvp.event.date).toLocaleString()}</p>
                <p><strong>📍 Location:</strong> {rsvp.event.location}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyRsvps;
