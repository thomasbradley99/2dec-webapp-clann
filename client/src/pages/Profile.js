import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import teamService from '../services/teamService';
import authService from '../services/authService';
import NavBar from '../components/ui/NavBar';
import Header from '../components/ui/Header';
import api from '../services/api';

// Debug log to verify the key
console.log('Stripe Public Key:', process.env.REACT_APP_STRIPE_PUBLIC_KEY ? 'Present' : 'Missing');

// Add debugging for the Stripe key
const STRIPE_PUBLIC_KEY = process.env.REACT_APP_STRIPE_PUBLIC_KEY;
console.log('Initializing Stripe with key:', STRIPE_PUBLIC_KEY ? 'Key exists' : 'Key missing');

// Initialize Stripe outside component
const stripePromise = loadStripe(STRIPE_PUBLIC_KEY);

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

    const handleUpgrade = async (teamId) => {
        try {
            console.log('Starting upgrade process...');

            // Get Stripe instance
            const stripe = await stripePromise;
            if (!stripe) {
                throw new Error('Failed to initialize Stripe');
            }

            // Create checkout session
            const response = await fetch(`${process.env.REACT_APP_API_URL}/create-checkout-session`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ teamId }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to create checkout session');
            }

            const { id: sessionId } = await response.json();
            console.log('Created checkout session:', sessionId);

            // Redirect to checkout
            const { error } = await stripe.redirectToCheckout({ sessionId });

            if (error) {
                console.error('Stripe redirect error:', error);
                throw error;
            }
        } catch (error) {
            console.error('Payment flow error:', error);
            alert('Payment initialization failed: ' + error.message);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white pb-20">
            <Header />
            <div className="max-w-7xl mx-auto p-4 md:p-8">
                <div className="space-y-8">
                    <div className="bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700">
                        <h2 className="text-xl font-semibold mb-4">Profile</h2>
                        <div className="space-y-2">
                            <label className="text-sm text-gray-400">Email</label>
                            <p className="text-lg">{user?.email || 'Loading...'}</p>
                        </div>
                    </div>

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
                                    <div key={team.id} className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden transition-all duration-200 hover:border-gray-600">
                                        <div className="p-6 relative">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="text-lg font-medium">{team.name}</h4>
                                                    <div className="mt-2 space-y-1">
                                                        <p className="text-sm text-gray-400">
                                                            Team Code: <span className="font-mono">{team.team_code}</span>
                                                        </p>
                                                        <p className="text-sm text-gray-400">
                                                            Role: <span className={team.is_admin ? 'text-green-400' : ''}>{team.is_admin ? 'Admin' : 'Member'}</span>
                                                        </p>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-medium">Status:</span>
                                                            {team.is_premium ? (
                                                                <span className="px-2 py-1 bg-green-400/10 text-green-400 rounded-full text-xs border border-green-400">
                                                                    ⭐️ PREMIUM
                                                                </span>
                                                            ) : (
                                                                <span className="px-2 py-1 bg-gray-400/10 text-gray-400 rounded-full text-xs border border-gray-400">
                                                                    FREE
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                {!team.is_premium && (
                                                    <button
                                                        onClick={() => handleUpgrade(team.id)}
                                                        className="text-sm px-4 py-2 bg-green-400/10 text-green-400 
                                                                   rounded-lg border border-green-400 
                                                                   hover:bg-green-400/20 transition-colors"
                                                    >
                                                        Upgrade to Premium
                                                    </button>
                                                )}
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
