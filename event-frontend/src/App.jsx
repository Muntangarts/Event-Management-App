import { useState, useEffect } from 'react';
import './App.css';
import Login from './components/Login';
import EventList from './components/EventList';
import CreateEvent from './components/CreateEvent';
import MyRsvps from './components/MyRsvps';
import useWebSocket from './hooks/useWebSocket';

const API_BASE = 'http://localhost:3000/api';

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [events, setEvents] = useState([]);
  const [myRsvps, setMyRsvps] = useState([]);
  
  const { connected, sendMessage } = useWebSocket(
    user ? 'ws://localhost:3000/ws' : null,
    (data) => handleWebSocketMessage(data)
  );

  useEffect(() => {
    // Check for stored token
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    if (user && token) {
      loadEvents();
      loadMyRsvps();
    }
  }, [user, token]);

  const handleWebSocketMessage = (data) => {
    if (data.type === 'EVENT_CREATED') {
      setEvents(prev => [data.payload, ...prev]);
    } else if (data.type === 'EVENT_UPDATED' || data.type === 'EVENT_APPROVED') {
      setEvents(prev => prev.map(e => e.id === data.payload.id ? data.payload : e));
    } else if (data.type === 'EVENT_DELETED') {
      setEvents(prev => prev.filter(e => e.id !== data.payload.id));
    } else if (data.type === 'RSVP_CREATED' || data.type === 'RSVP_UPDATED') {
      loadMyRsvps();
    }
  };

  const loadEvents = async () => {
    try {
      const response = await fetch(`${API_BASE}/events`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      }
    } catch (error) {
      console.error('Failed to load events:', error);
    }
  };

  const loadMyRsvps = async () => {
    try {
      const response = await fetch(`${API_BASE}/my-rsvps`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setMyRsvps(data);
      }
    } catch (error) {
      console.error('Failed to load RSVPs:', error);
    }
  };

  const handleLogin = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('token', authToken);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    setEvents([]);
    setMyRsvps([]);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="user-info">
          <h1>🎉 Event Management</h1>
          <p>Welcome, <strong>{user.email}</strong> <span className="badge">{user.role}</span></p>
        </div>
        <div className="header-actions">
          <div className="ws-status">
            <span className={`status-dot ${connected ? 'connected' : 'disconnected'}`}></span>
            <span>{connected ? 'Live' : 'Disconnected'}</span>
          </div>
          <button onClick={handleLogout} className="btn btn-secondary">Logout</button>
        </div>
      </header>

      <main className="app-main">
        {(user.role === 'ORGANIZER' || user.role === 'ADMIN') && (
          <CreateEvent token={token} onEventCreated={loadEvents} />
        )}
        
        <EventList 
          events={events}
          user={user}
          token={token}
          myRsvps={myRsvps}
          onEventDeleted={loadEvents}
          onEventApproved={loadEvents}
          onRsvpUpdated={loadMyRsvps}
        />
        
        <MyRsvps rsvps={myRsvps} />
      </main>
    </div>
  );
}

export default App;
