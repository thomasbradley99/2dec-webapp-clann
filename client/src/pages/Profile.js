import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import teamService from '../services/teamService';

function Profile() {
    const navigate = useNavigate();
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('user'));
        if (!userData) {
            navigate('/');
            return;
        }
        setUser(userData);
        fetchTeams();
    }, [navigate]);

    const fetchTeams = async () => {
        try {
            const userTeams = await teamService.getUserTeams();
            setTeams(userTeams);
        } catch (err) {
            setError('Failed to load teams');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/');
    };

    return (
        <div style={{ 
            backgroundColor: '#1a1a1a', 
            minHeight: '100vh',
            color: '#ffffff'
        }}>
            <div style={{ padding: '20px', paddingBottom: '80px' }}>
                <h2>Profile</h2>
                
                {/* Profile Info */}
                <div style={{ 
                    backgroundColor: '#333333', 
                    padding: '20px', 
                    borderRadius: '8px',
                    marginTop: '20px'
                }}>
                    <p style={{ color: '#888888' }}>Email</p>
                    <p style={{ marginTop: '5px' }}>{user?.email || 'Loading...'}</p>
                    
                    <p style={{ color: '#888888', marginTop: '20px' }}>Role</p>
                    <p style={{ marginTop: '5px' }}>{user?.role || 'Loading...'}</p>
                </div>

                {/* Teams Section */}
                <div style={{ 
                    backgroundColor: '#333333', 
                    padding: '20px', 
                    borderRadius: '8px',
                    marginTop: '20px'
                }}>
                    <h3>Your Teams</h3>
                    {loading ? (
                        <p>Loading teams...</p>
                    ) : error ? (
                        <p style={{ color: '#FF4444' }}>{error}</p>
                    ) : teams.length === 0 ? (
                        <p>No teams yet. Upload a session to create a team!</p>
                    ) : (
                        <div style={{ marginTop: '15px' }}>
                            {teams.map(team => (
                                <div 
                                    key={team.id}
                                    style={{
                                        padding: '15px',
                                        backgroundColor: '#1a1a1a',
                                        borderRadius: '4px',
                                        marginBottom: '10px'
                                    }}
                                >
                                    <p style={{ fontWeight: 'bold' }}>{team.name}</p>
                                    <p style={{ color: '#888888', fontSize: '14px' }}>
                                        Team Code: {team.team_code}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <button 
                    onClick={handleLogout}
                    style={{
                        width: '100%',
                        padding: '12px',
                        backgroundColor: '#1a1a1a',
                        border: '1px solid #016F33',  // Clann green border
                        color: '#016F33',            // Clann green text
                        borderRadius: '4px',
                        marginTop: '30px',
                        cursor: 'pointer',
                        fontSize: '16px',
                        fontWeight: '500',
                        transition: 'all 0.2s ease',  // Smooth transition for hover
                        // Hover styles will be handled by onMouseOver/onMouseOut
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
}

export default Profile;
