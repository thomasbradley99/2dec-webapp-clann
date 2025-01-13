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
        <div className="max-w-4xl mx-auto">
          {/* Logo and Title */}
          <div className="flex items-center gap-4 mb-8">
            <img src="/luke.svg" alt="CLANN" className="h-12 w-12" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
              Access Sessions
            </h1>
          </div>

          {/* Feedback Messages */}
          {feedback && (
            <div className={`mb-6 p-4 rounded-lg border ${feedback.type === 'error'
              ? 'bg-red-500/20 border-red-500/30 text-red-400'
              : 'bg-green-500/20 border-green-500/30 text-green-400'
              }`}>
              {feedback.message}
            </div>
          )}

          {/* Upload and Join Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {/* Upload New Game */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 hover:border-green-500/30 transition-all">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl">🎥</span>
                <h2 className="text-xl font-bold">Upload New Game</h2>
              </div>
              <form onSubmit={handleUpload} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Game Footage URL</label>
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://app.veo.co/..."
                    className="w-full bg-gray-900/50 text-white px-4 py-2 rounded-lg border border-gray-700/50 
                             focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 focus:outline-none
                             transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Team Name</label>
                  <input
                    type="text"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="Team Name"
                    className="w-full bg-gray-900/50 text-white px-4 py-2 rounded-lg border border-gray-700/50 
                             focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 focus:outline-none
                             transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading || !url.trim() || !teamName.trim()}
                  className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${isLoading || !url.trim() || !teamName.trim()
                    ? 'bg-green-600/20 text-green-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-500 text-white'
                    }`}
                >
                  {isLoading ? 'Uploading...' : 'Upload Game'}
                </button>
              </form>
            </div>

            {/* Join Team */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 hover:border-green-500/30 transition-all">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl">👥</span>
                <h2 className="text-xl font-bold">Join Existing Team</h2>
              </div>
              <form onSubmit={handleJoinTeam} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Team Code</label>
                  <input
                    type="text"
                    value={teamCode}
                    onChange={(e) => setTeamCode(e.target.value)}
                    placeholder="Enter Team Code"
                    maxLength={6}
                    className="w-full bg-gray-900/50 text-white px-4 py-2 rounded-lg border border-gray-700/50 
                             focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 focus:outline-none
                             transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${isLoading
                    ? 'bg-blue-600/20 text-blue-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-500 text-white'
                    }`}
                >
                  {isLoading ? 'Joining...' : 'Join Team'}
                </button>
              </form>
            </div>
          </div>

          {/* Sessions List */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📊</span>
              <h2 className="text-2xl font-bold">Your Sessions</h2>
            </div>

            {isLoading ? (
              <p className="text-gray-400">Loading sessions...</p>
            ) : sessions?.length === 0 ? (
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
