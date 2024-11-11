import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import sessionService from '../services/sessionService';
import NavBar from '../components/NavBar';

function Sessions() {
  const [url, setUrl] = useState('');
  const [teamName, setTeamName] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sessions, setSessions] = useState([]);

  const handleUpload = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setFeedback(null);
    
    try {
      const response = await sessionService.createSession(url, teamName);
      setFeedback({
        type: 'success',
        message: `Success! Your team code is: ${response.team_code}`,
      });
      setUrl('');
      setTeamName('');
      fetchSessions();
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.message || 'Upload failed',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSessions = async () => {
    try {
      const response = await sessionService.getSessions();
      setSessions(response);
    } catch (err) {
      console.error('Failed to fetch sessions:', err);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleDelete = async (sessionId) => {
    if (window.confirm('Are you sure you want to delete this session?')) {
      try {
        await sessionService.deleteSession(sessionId);
        setFeedback({
          type: 'success',
          message: 'Session deleted successfully'
        });
        fetchSessions();
      } catch (err) {
        setFeedback({
          type: 'error',
          message: err.message || 'Failed to delete session'
        });
      }
    }
  };

  return (
    <div style={{ 
      backgroundColor: '#1a1a1a', 
      minHeight: '100vh',
      color: '#ffffff'
    }}>
      <div style={{ padding: '20px', paddingBottom: '80px' }}>
        <h2>Sessions</h2>
        
        <div style={{ marginBottom: '30px' }}>
          <form onSubmit={handleUpload}>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Game Footage URL"
              style={{ 
                width: '100%', 
                marginBottom: '10px', 
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #555',
                backgroundColor: '#1a1a1a',
                color: 'white'
              }}
            />
            <input
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="Team Name"
              style={{ 
                width: '100%', 
                marginBottom: '10px', 
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #555',
                backgroundColor: '#1a1a1a',
                color: 'white'
              }}
            />
            <button 
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: isLoading ? '#014422' : '#016F33',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: isLoading ? 'not-allowed' : 'pointer'
              }}
            >
              {isLoading ? 'Uploading...' : 'Upload Game'}
            </button>
          </form>
        </div>

        {feedback && (
          <div style={{
            padding: '15px',
            marginTop: '20px',
            borderRadius: '4px',
            backgroundColor: feedback.type === 'success' ? '#016F33' : '#FF4444',
            color: 'white'
          }}>
            {feedback.message}
          </div>
        )}

        <div style={{ marginTop: '30px' }}>
          <h3>Recent Sessions</h3>
          {sessions.length === 0 ? (
            <p>No sessions uploaded yet.</p>
          ) : (
            <div>
              {sessions.map(session => (
                <div 
                  key={session.id}
                  style={{
                    padding: '15px',
                    marginBottom: '10px',
                    backgroundColor: '#1a1a1a',
                    borderRadius: '4px',
                    border: '1px solid #333',
                    position: 'relative'
                  }}
                >
                  <button
                    onClick={() => handleDelete(session.id)}
                    style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      backgroundColor: '#FF4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '5px 10px',
                      cursor: 'pointer'
                    }}
                  >
                    Delete
                  </button>
                  <p>Team: {session.team_name}</p>
                  <p>URL: {session.footage_url}</p>
                  <p>Status: {session.status}</p>
                  <p>Uploaded: {new Date(session.created_at).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <NavBar />
    </div>
  );
}

export default Sessions;
