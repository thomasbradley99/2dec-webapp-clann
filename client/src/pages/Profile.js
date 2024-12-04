import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import teamService from '../services/teamService';
import authService from '../services/authService';
import NavBar from '../components/ui/NavBar';
import Header from '../components/ui/Header';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe('pk_test_51QRdu2HwuGVunWPuiliiMDR8pKZn69vUWlJ27MobHRq66FJ2LGd0h7JHjzFS4htWKo6v1oQnCpOtZ4xegSDiw57F00DXGx68uh');

function Profile() {
    const navigate = useNavigate();
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [user, setUser] = useState(null);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [teamMembers, setTeamMembers] = useState({});
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

    useEffect(() => {
        if (teams.length > 0) {
            teams.forEach(team => {
                fetchTeamMembers(team.id);
            });
        }
    }, [teams]);

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
            setTeamMembers(prev => ({
                ...prev,
                [teamId]: members
            }));
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
                localStorage.removeItem('token');
                navigate('/');
            } catch (err) {
                alert(err);
            }
        }
    };

    const handleUpgrade = async () => {
        const stripe = await stripePromise;
        const { error } = await stripe.redirectToCheckout({
            lineItems: [{ price: 'price_1QReM5HwuGVunWPu2cLxc8i3', quantity: 1 }],
            mode: 'subscription',
            successUrl: 'https://your-site.com/success',
            cancelUrl: 'https://your-site.com/cancel',
        });
        if (error) {
            console.error('Error:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white pb-20">
            <Header />
            <div className="max-w-7xl mx-auto p-4 md:p-8">
                {/* Profile Section */}
                <div className="space-y-8">
                    {/* Email Card */}
                    <div className="bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700">
                        <h2 className="text-xl font-semibold mb-4">Profile</h2>
                        <div className="space-y-2">
                            <label className="text-sm text-gray-400">Email</label>
                            <p className="text-lg">{user?.email || 'Loading...'}</p>
                            <p className="text-lg">
                                {user?.isPremium ? 'Premium User' : 'Demo User'}
                                {!user?.isPremium && (
                                    <button
                                        onClick={handleUpgrade}
                                        className="ml-4 text-blue-400 underline"
                                    >
                                        Upgrade to Premium
                                    </button>
                                )}
                            </p>
                        </div>
                    </div>

                    {/* Teams Section */}
                    <div className="bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700">
                        <h3 className="text-xl font-semibold mb-4">Your Teams</h3>
                        
                        {loading ? (
                            <p className="text-gray-400">Loading teams...</p>
                        ) : error ? (
                            <p className="text-red-400">{error}</p>
                        ) : teams.length === 0 ? (
                            <p className="text-gray-400">No teams yet. Upload a session to create a team!</p>
                        ) : (
                            <div className="space-y-4">
                                {teams.map(team => (
                                    <div 
                                        key={team.id}
                                        className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden transition-all duration-200 hover:border-gray-600"
                                    >
                                        {/* Team Header */}
                                        <div className="p-6 relative">
                                            {team.is_admin ? (
                                                <button
                                                    onClick={async () => {
                                                        if (window.confirm('Are you sure you want to delete this team? This action cannot be undone.')) {
                                                            try {
                                                                await teamService.deleteTeam(team.id);
                                                                setFeedback({
                                                                    type: 'success',
                                                                    message: 'Team deleted successfully'
                                                                });
                                                                fetchTeams();
                                                            } catch (err) {
                                                                setFeedback({
                                                                    type: 'error',
                                                                    message: err.message || 'Failed to delete team'
                                                                });
                                                            }
                                                        }
                                                    }}
                                                    className="absolute top-4 right-4 px-3 py-1.5 text-sm font-medium text-red-400 bg-red-400/10 
                                                             border border-red-400 rounded hover:bg-red-400/20 transition-colors"
                                                >
                                                    Delete Team
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={async () => {
                                                        if (window.confirm('Are you sure you want to leave this team?')) {
                                                            try {
                                                                await teamService.leaveTeam(team.id);
                                                                setFeedback({
                                                                    type: 'success',
                                                                    message: 'Successfully left team'
                                                                });
                                                                fetchTeams();
                                                            } catch (err) {
                                                                setFeedback({
                                                                    type: 'error',
                                                                    message: err.message || 'Failed to leave team'
                                                                });
                                                            }
                                                        }
                                                    }}
                                                    className="absolute top-4 right-4 px-3 py-1.5 text-sm font-medium text-yellow-400 bg-yellow-400/10 
                                                             border border-yellow-400 rounded hover:bg-yellow-400/20 transition-colors"
                                                >
                                                    Leave Team
                                                </button>
                                            )}
                                            
                                            <h4 className="text-lg font-medium">{team.name}</h4>
                                            <div className="mt-2 space-y-1">
                                                <p className="text-sm text-gray-400">
                                                    Team Code: <span className="font-mono">{team.team_code}</span>
                                                </p>
                                                <p className="text-sm text-gray-400">
                                                    Role: <span className={team.is_admin ? 'text-green-400' : ''}>{team.is_admin ? 'Admin' : 'Member'}</span>
                                                </p>
                                            </div>
                                        </div>

                                        {/* Members List */}
                                        <div className="border-t border-gray-700 bg-gray-800/50">
                                            <div className="p-6">
                                                <h5 className="text-sm font-medium text-gray-300 mb-4">Team Members</h5>
                                                <div className="space-y-2">
                                                    {membersLoading ? (
                                                        <p className="text-sm text-gray-400">Loading members...</p>
                                                    ) : (
                                                        teamMembers[team.id]?.map((member, index) => (
                                                            <div 
                                                                key={index}
                                                                className="flex items-center justify-between py-2"
                                                            >
                                                                <span className="text-sm">{member.email}</span>
                                                                <div className="flex items-center gap-3">
                                                                    {team.is_admin && member.id !== user.id && (
                                                                        <>
                                                                            <label className="flex items-center gap-2 text-sm">
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
                                                                                    className="rounded border-gray-600 bg-gray-700 text-green-500 focus:ring-green-500"
                                                                                />
                                                                                <span className="text-gray-300">Admin</span>
                                                                            </label>
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
                                                                                className="text-xs px-2 py-1 text-red-400 bg-red-400/10 
                                                                                           border border-red-400 rounded hover:bg-red-400/20 
                                                                                           transition-colors"
                                                                            >
                                                                                {removingMember === member.id ? 'Removing...' : 'Remove'}
                                                                            </button>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                        <button 
                            onClick={handleLogout}
                            className="w-full py-3 px-4 bg-gray-900 text-green-400 border border-green-400 
                                     rounded-lg hover:bg-green-400/10 transition-colors"
                        >
                            Logout
                        </button>
                        <button 
                            onClick={handleDeleteAccount}
                            className="w-full py-3 px-4 bg-gray-900 text-red-400 border border-red-400 
                                     rounded-lg hover:bg-red-400/10 transition-colors"
                        >
                            Delete Account
                        </button>
                    </div>
                </div>
            </div>

            {/* Feedback Toast */}
            {feedback && (
                <div className={`fixed bottom-6 right-6 px-4 py-3 rounded-lg shadow-lg z-50 transition-all duration-300
                              ${feedback.type === 'success' ? 'bg-green-400/20 text-green-400 border border-green-400' : 
                                                            'bg-red-400/20 text-red-400 border border-red-400'}`}>
                    {feedback.message}
                </div>
            )}
            <NavBar />
        </div>
    );
}

export default Profile;
