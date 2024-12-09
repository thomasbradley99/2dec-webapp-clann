import React, { useState, useEffect } from 'react';
import sessionService from '../services/sessionService';
import teamService from '../services/teamService';
import NavBar from '../components/ui/NavBar';
import { Link } from 'react-router-dom';
import SessionCard from '../components/SessionCard';
import Header from '../components/ui/Header';

function Sessions() {
  const [url, setUrl] = useState('');
  const [teamName, setTeamName] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [teamCode, setTeamCode] = useState('');
  const [selectedAnalyses, setSelectedAnalyses] = useState({});

  useEffect(() => {
    fetchSessions();
    console.log('Sessions:', sessions);
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
        message: (
          <div className="flex flex-col gap-4">
            <p>Success! Your team code is: <span className="font-bold">{response.team_code}</span></p>
            <button
              onClick={() => copyToClipboard(response.team_code)}
              className="text-sm px-4 py-2 bg-green-500/20 text-green-400 
                         rounded-lg border border-green-500 
                         hover:bg-green-500/30 transition-colors"
            >
              📋 Copy Invite Message
            </button>
          </div>
        )
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
    if (!teamCode.trim()) {
      setFeedback({
        type: 'error',
        message: 'Please enter a team code'
      });
      return;
    }

    try {
      setIsLoading(true);
      const response = await teamService.joinTeam(teamCode);
      setFeedback({
        type: 'success',
        message: `Successfully joined team ${response.team_name}`
      });
      setTeamCode(''); // Clear the input
      fetchSessions(); // Refresh sessions to show new team's sessions
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
      console.log('Attempting to fetch sessions...');  // Debug log
      const response = await sessionService.getSessions();
      console.log('Sessions fetched:', response);  // Debug log
      setSessions(response || []);
    } catch (err) {
      console.error('Failed to fetch sessions:', err);
      setFeedback({
        type: 'error',
        message: err.message || 'Failed to fetch sessions'
      });
      setSessions([]);
    }
  };

  const handleDelete = async (sessionId) => {
    try {
      await sessionService.deleteSession(sessionId);
      setFeedback({
        type: 'success',
        message: 'Session deleted successfully'
      });
      // Refresh sessions list
      fetchSessions();
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.message || 'Failed to delete session'
      });
    }
  };

  const handleAnalysisSelect = (sessionId, type) => {
    setSelectedAnalyses(prev => ({
      ...prev,
      [sessionId]: type
    }));
  };

  const generateShareMessage = (teamCode) => {
    const message = `🏃‍♂️ Join my team on Clann AI to see our game analysis!\n\n` +
      `1. Go to https://clannai.com\n` +
      `2. Create an account or sign in\n` +
      `3. Click "Join Team"\n` +
      `4. Enter team code: ${teamCode}\n\n` +
      `See you there! 🎮`;
    return message;
  };

  const copyToClipboard = (teamCode) => {
    const message = generateShareMessage(teamCode);
    navigator.clipboard.writeText(message);
    setFeedback({
      type: 'success',
      message: 'Invite message copied to clipboard! Share it with your team.'
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white pb-20">
      <Header />
      <div className="max-w-7xl mx-auto p-4 md:p-8">
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
                  maxLength={6}
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
                  {isLoading ? 'Joining...' : 'Join Team'}
                </button>
              </form>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-bold mb-6">Your Sessions</h2>
            {isLoading ? (
              <p className="text-gray-400">Loading sessions...</p>
            ) : sessions.length === 0 ? (
              <p className="text-gray-400">No sessions uploaded yet.</p>
            ) : (
              <div className="space-y-4">
                {sessions.map(session => (
                  <SessionCard
                    key={session.id}
                    session={session}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <NavBar />
    </div>
  );
}

export default Sessions;
