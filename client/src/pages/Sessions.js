import React, { useState, useEffect } from 'react';
import sessionService from '../services/sessionService';
import teamService from '../services/teamService';
import NavBar from '../components/NavBar';

function Sessions() {
  const [url, setUrl] = useState('');
  const [teamName, setTeamName] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [teamCode, setTeamCode] = useState('');

  useEffect(() => {
    fetchSessions();
    fetchUserTeams();
  }, []);

  const fetchUserTeams = async () => {
    try {
      const teams = await teamService.getUserTeams();
      // If user has teams, pre-fill with most recent team name
      if (teams.length > 0) {
        setTeamName(teams[0].name);
      }
    } catch (err) {
      console.error('Failed to fetch teams:', err);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setFeedback(null);
    
    if (!url.trim()) {
      setFeedback({
        type: 'error',
        message: 'Please enter a game footage URL'
      });
      setIsLoading(false);
      return;
    }

    // Check if URL already exists in current sessions
    const urlExists = sessions.some(session => session.footage_url === url.trim());
    if (urlExists) {
      setFeedback({
        type: 'error',
        message: 'This footage URL has already been uploaded'
      });
      setIsLoading(false);
      return;
    }

    if (!teamName.trim()) {
      setFeedback({
        type: 'error',
        message: 'Please enter a team name'
      });
      setIsLoading(false);
      return;
    }
    
    try {
      const response = await sessionService.createSession(url.trim(), teamName.trim());
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

  const handleJoinTeam = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setFeedback(null);

    if (!teamCode.trim()) {
      setFeedback({
        type: 'error',
        message: 'Please enter a team code'
      });
      setIsLoading(false);
      return;
    }

    try {
      await sessionService.joinTeam(teamCode.trim());
      setFeedback({
        type: 'success',
        message: 'Successfully joined team!'
      });
      setTeamCode('');
      fetchSessions();
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.message || 'Failed to join team'
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
      setFeedback({
        type: 'error',
        message: 'Failed to fetch sessions'
      });
    }
  };

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
      color: '#ffffff',
      paddingBottom: '80px'
    }}>
      <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
        <h2>Access Sessions</h2>
        
        {feedback && (
          <div style={{
            padding: '10px',
            marginBottom: '20px',
            borderRadius: '4px',
            backgroundColor: feedback.type === 'error' ? '#ff00001a' : '#0080001a',
            color: feedback.type === 'error' ? '#ff0000' : '#008000'
          }}>
            {feedback.message}
          </div>
        )}

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: '20px',
          marginBottom: '30px'
        }}>
          <div style={{ 
            padding: '20px', 
            backgroundColor: '#333333', 
            borderRadius: '8px' 
          }}>
            <h3>Upload New Game</h3>
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
                disabled={isLoading || !url.trim() || !teamName.trim()}
                style={{
                  width: '100%',
                  padding: '10px',
                  backgroundColor: isLoading || !url.trim() || !teamName.trim() ? '#014422' : '#016F33',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: isLoading || !url.trim() || !teamName.trim() ? 'not-allowed' : 'pointer'
                }}
              >
                {isLoading ? 'Uploading...' : 'Upload Game'}
              </button>
            </form>
          </div>

          <div style={{ 
            padding: '20px', 
            backgroundColor: '#333333', 
            borderRadius: '8px' 
          }}>
            <h3>Join Existing Team</h3>
            <form onSubmit={handleJoinTeam}>
              <input
                type="text"
                value={teamCode}
                onChange={(e) => setTeamCode(e.target.value)}
                placeholder="Enter Team Code"
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
                disabled={isLoading || !teamCode.trim()}
                style={{
                  width: '100%',
                  padding: '10px',
                  backgroundColor: isLoading || !teamCode.trim() ? '#014422' : '#016F33',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: isLoading || !teamCode.trim() ? 'not-allowed' : 'pointer'
                }}
              >
                {isLoading ? 'Joining...' : 'Join Team'}
              </button>
            </form>
          </div>
        </div>

        <div style={{ marginTop: '30px' }}>
          <h3>Your Sessions</h3>
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
