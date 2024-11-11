import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import sessionService from '../services/sessionService';

function Dashboard() {
  const [activeTab, setActiveTab] = useState('sessions');
  const [url, setUrl] = useState('');
  const [teamName, setTeamName] = useState('');
  const [message, setMessage] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sessions, setSessions] = useState([]);
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/');
  };

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
            fetchSessions(); // Refresh the list
        } catch (err) {
            setFeedback({
                type: 'error',
                message: err.message || 'Failed to delete session'
            });
        }
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'sessions':
        return (
          <div style={{ padding: '20px' }}>
            <h2>Sessions</h2>
            
            {/* Upload Form */}
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

            {/* Feedback message */}
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

            {/* Sessions List */}
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
        );
      case 'profile':
        return (
          <div style={{ padding: '20px' }}>
            <h2>Profile</h2>
            <div style={{ 
              backgroundColor: '#333333', 
              padding: '20px', 
              borderRadius: '8px',
              marginTop: '20px'
            }}>
              <p style={{ color: '#888888' }}>Email</p>
              <p style={{ marginTop: '5px' }}>coach@team.com</p>
              
              <p style={{ color: '#888888', marginTop: '20px' }}>Role</p>
              <p style={{ marginTop: '5px' }}>Team Admin</p>

              <button 
                onClick={handleLogout}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #016F33',
                  color: '#016F33',
                  borderRadius: '4px',
                  marginTop: '30px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = '#016F33';
                  e.target.style.color = '#ffffff';
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = '#1a1a1a';
                  e.target.style.color = '#016F33';
                }}
              >
                Logout
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ 
      backgroundColor: '#1a1a1a', 
      minHeight: '100vh',
      color: '#ffffff'
    }}>
      {/* Content */}
      <div style={{ padding: '20px', paddingBottom: '80px' }}>
        {renderContent()}
      </div>

      {/* Navigation Bar */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '60px',
        backgroundColor: '#333333',
        display: 'flex',
        justifyContent: 'space-between',
        padding: '0 40px',
        boxShadow: '0 -2px 10px rgba(0,0,0,0.2)'
      }}>
        <button
          onClick={() => setActiveTab('sessions')}
          style={{
            background: 'none',
            border: 'none',
            color: activeTab === 'sessions' ? '#016F33' : '#888888',
            fontSize: '16px',
            cursor: 'pointer',
            padding: '0 20px',
            height: '100%',
            transition: 'color 0.2s'
          }}
        >
          Sessions
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          style={{
            background: 'none',
            border: 'none',
            color: activeTab === 'profile' ? '#016F33' : '#888888',
            fontSize: '16px',
            cursor: 'pointer',
            padding: '0 20px',
            height: '100%',
            transition: 'color 0.2s'
          }}
        >
          Profile
        </button>
      </div>
    </div>
  );
}

export default Dashboard;