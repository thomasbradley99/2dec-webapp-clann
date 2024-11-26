import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import teamService from '../services/teamService';
import authService from '../services/authService';
import NavBar from '../components/ui/NavBar';

function Profile() {
    const navigate = useNavigate();
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [user, setUser] = useState(null);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [teamMembers, setTeamMembers] = useState([]);
    const [membersLoading, setMembersLoading] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [removingMember, setRemovingMember] = useState(null);

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('user'));
        if (!userData) {
            navigate('/');
            return;
        }
        setUser(userData);
        fetchTeams();
    }, [navigate]);

    useEffect(() => {
        if (feedback) {
            const timer = setTimeout(() => {
                setFeedback(null);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [feedback]);

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

    const fetchTeamMembers = async (teamId) => {
        setMembersLoading(true);
        try {
            const members = await teamService.getTeamMembers(teamId);
            setTeamMembers(members);
        } catch (err) {
            setError(err.message);
        } finally {
            setMembersLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/');
    };

    const handleDeleteAccount = async () => {
        if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            try {
                await authService.deleteAccount();
                localStorage.removeItem('user');
                navigate('/');
            } catch (err) {
                alert(err);
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
            <div style={{ padding: '20px' }}>
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
                                        marginBottom: '10px',
                                        border: '1px solid #333'
                                    }}
                                >
                                    <p style={{ fontWeight: 'bold' }}>{team.name}</p>
                                    <p style={{ 
                                        color: '#888888', 
                                        fontSize: '14px',
                                        marginTop: '5px'
                                    }}>
                                        Team Code: {team.team_code}
                                    </p>
                                    <p style={{ 
                                        color: '#888888', 
                                        fontSize: '14px',
                                        marginTop: '5px'
                                    }}>
                                        Role: {team.is_admin ? 'Admin' : 'Member'}
                                    </p>
                                    
                                    {/* View Members Button */}
                                    <button
                                        onClick={() => {
                                            if (selectedTeam === team.id) {
                                                setSelectedTeam(null);
                                                setTeamMembers([]);
                                            } else {
                                                setSelectedTeam(team.id);
                                                fetchTeamMembers(team.id);
                                            }
                                        }}
                                        style={{
                                            background: 'none',
                                            border: '1px solid #016F33',
                                            color: '#016F33',
                                            padding: '5px 10px',
                                            borderRadius: '4px',
                                            marginTop: '10px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {selectedTeam === team.id ? 'Hide Members' : 'View Members'}
                                    </button>

                                    {/* Members List */}
                                    {selectedTeam === team.id && (
                                        <div style={{ marginTop: '10px' }}>
                                            {membersLoading ? (
                                                <p>Loading members...</p>
                                            ) : (
                                                <div style={{ 
                                                    marginTop: '10px',
                                                    padding: '10px',
                                                    backgroundColor: '#2a2a2a',
                                                    borderRadius: '4px'
                                                }}>
                                                    <h4 style={{ marginBottom: '10px' }}>Team Members</h4>
                                                    {teamMembers.map((member, index) => (
                                                        <div 
                                                            key={index}
                                                            style={{
                                                                padding: '5px',
                                                                display: 'flex',
                                                                justifyContent: 'space-between',
                                                                alignItems: 'center',
                                                                borderBottom: index !== teamMembers.length - 1 ? '1px solid #333' : 'none'
                                                            }}
                                                        >
                                                            <div>
                                                                <span>{member.email}</span>
                                                            </div>
                                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                                {/* Admin Toggle */}
                                                                {team.is_admin && member.id !== user.id && (
                                                                    <label style={{ marginRight: '10px', display: 'flex', alignItems: 'center' }}>
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={member.is_admin}
                                                                            onChange={async () => {
                                                                                try {
                                                                                    await teamService.toggleAdminStatus(team.id, member.id, !member.is_admin);
                                                                                    setFeedback({ type: 'success', message: 'Admin status updated successfully' });
                                                                                    fetchTeamMembers(team.id);
                                                                                } catch (err) {
                                                                                    setFeedback({ type: 'error', message: err.message });
                                                                                }
                                                                            }}
                                                                            style={{ marginRight: '5px' }}
                                                                        />
                                                                        <span>Admin</span>
                                                                    </label>
                                                                )}
                                                                {/* Remove Button */}
                                                                {team.is_admin && member.id !== user.id && (
                                                                    <button
                                                                        onClick={async () => {
                                                                            if (window.confirm(`Are you sure you want to remove ${member.email} from the team?`)) {
                                                                                setRemovingMember(member.id);
                                                                                try {
                                                                                    await teamService.removeTeamMember(team.id, member.id);
                                                                                    setFeedback({
                                                                                        type: 'success',
                                                                                        message: 'Member removed successfully'
                                                                                    });
                                                                                    fetchTeamMembers(team.id);
                                                                                } catch (err) {
                                                                                    setFeedback({
                                                                                        type: 'error',
                                                                                        message: err.message
                                                                                    });
                                                                                } finally {
                                                                                    setRemovingMember(null);
                                                                                }
                                                                            }
                                                                        }}
                                                                        style={{
                                                                            background: 'none',
                                                                            border: '1px solid #FF4444',
                                                                            color: '#FF4444',
                                                                            padding: '2px 8px',
                                                                            borderRadius: '4px',
                                                                            cursor: 'pointer',
                                                                            fontSize: '12px'
                                                                        }}
                                                                    >
                                                                        {removingMember === member.id ? 'Removing...' : 'Remove from Team'}
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {feedback && (
                    <div style={{
                        padding: '10px',
                        marginTop: '10px',
                        backgroundColor: feedback.type === 'success' ? '#016F33' : '#FF4444',
                        borderRadius: '4px',
                        position: 'fixed',
                        bottom: '20px',
                        right: '20px',
                        zIndex: 1000
                    }}>
                        {feedback.message}
                    </div>
                )}

                {/* Logout Button */}
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
                        transition: 'all 0.2s ease'
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

                {/* Delete Account Button */}
                <button 
                    onClick={handleDeleteAccount}
                    style={{
                        width: '100%',
                        padding: '12px',
                        backgroundColor: '#1a1a1a',
                        border: '1px solid #FF4444',
                        color: '#FF4444',
                        borderRadius: '4px',
                        marginTop: '10px',
                        cursor: 'pointer',
                        fontSize: '16px',
                        transition: 'all 0.2s ease'
                    }}
                    onMouseOver={(e) => {
                        e.target.style.backgroundColor = '#FF4444';
                        e.target.style.color = '#ffffff';
                    }}
                    onMouseOut={(e) => {
                        e.target.style.backgroundColor = '#1a1a1a';
                        e.target.style.color = '#FF4444';
                    }}
                >
                    Delete Account
                </button>
            </div>
            <NavBar />
        </div>
    );
}

export default Profile;
