import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SessionCard from './SessionCard';
import NavBar from '../../components/ui/NavBar';
import sessionService from '../../services/sessionService';
import Header from '../../components/ui/Header';
import StatsOverview from '../../components/dashboard/StatsOverview';

function CompanyDashboard() {
    const navigate = useNavigate();
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [view, setView] = useState('PENDING');
    const [sortOrder, setSortOrder] = useState('oldest');

    const organizedSessions = {
        pending: sessions.filter(s => s.status === 'PENDING')
            .sort((a, b) => {
                const dateA = new Date(a.created_at);
                const dateB = new Date(b.created_at);
                return sortOrder === 'oldest' ? dateA - dateB : dateB - dateA;
            }),
        completed: sessions.filter(s => s.status === 'REVIEWED')
            .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
    };

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || user.role !== 'COMPANY_MEMBER') {
            navigate('/');
            return;
        }
        fetchSessions();
    }, [navigate]);

    const fetchSessions = async () => {
        try {
            const data = await sessionService.getAllSessions();
            setSessions(data);
        } catch (err) {
            setError('Failed to fetch sessions');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-5">Loading sessions...</div>;
    if (error) return <div className="p-5 text-red-500">{error}</div>;

    return (
        <div className="min-h-screen bg-gray-900 text-white pb-20">
            <Header />
            <div className="max-w-7xl mx-auto p-4 md:p-8">
                <StatsOverview />

                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl">Session Management</h2>
                    <div className="flex gap-4">
                        <div className="flex gap-2">
                            <button
                                onClick={() => setView('PENDING')}
                                className={`px-4 py-2 rounded ${view === 'PENDING' ? 'bg-yellow-500' : 'bg-gray-700'}`}
                            >
                                Pending ({organizedSessions.pending.length})
                            </button>
                            <button
                                onClick={() => setView('COMPLETED')}
                                className={`px-4 py-2 rounded ${view === 'COMPLETED' ? 'bg-green-500' : 'bg-gray-700'}`}
                            >
                                Completed ({organizedSessions.completed.length})
                            </button>
                        </div>
                        <button
                            onClick={() => setSortOrder(current => current === 'oldest' ? 'newest' : 'oldest')}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded hover:bg-gray-700"
                        >
                            {sortOrder === 'oldest' ? '⬆️ Oldest First' : '⬇️ Newest First'}
                        </button>
                    </div>
                </div>

                <div className="space-y-4">
                    {view === 'PENDING' && (
                        <div className="grid gap-4">
                            {organizedSessions.pending.map(session => (
                                <div
                                    key={session.id}
                                    onClick={() => navigate(`/session/${session.id}`)}
                                    className="bg-gray-800 p-6 rounded-lg border-l-4 border-yellow-500 cursor-pointer 
                                             hover:bg-gray-750 transition-colors"
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-xl font-bold">{session.team_name}</h3>
                                            <div className="text-sm text-gray-400 mt-2 space-y-1">
                                                <p>Waiting: {getDaysWaiting(session.created_at)} days</p>
                                                <p>Source: {getSourceType(session.footage_url)}</p>
                                                <p>URL: <a href={session.footage_url} target="_blank" rel="noopener noreferrer"
                                                    className="text-blue-400 hover:underline"
                                                    onClick={e => e.stopPropagation()}>
                                                    {session.footage_url}
                                                </a></p>
                                                <p>Uploaded by: {session.uploader_email}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {view === 'COMPLETED' && (
                        <div className="grid gap-4">
                            {organizedSessions.completed.map(session => (
                                <div
                                    key={session.id}
                                    onClick={() => navigate(`/session/${session.id}`)}
                                    className="bg-gray-800 p-6 rounded-lg border-l-4 border-green-500 cursor-pointer 
                                             hover:bg-gray-750 transition-colors"
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-xl font-bold">{session.team_name}</h3>
                                            <div className="text-sm text-gray-400 mt-2 space-y-1">
                                                <p>Completed: {new Date(session.updated_at).toLocaleDateString()}</p>
                                                <p>Turnaround: {getTurnaroundTime(session.created_at, session.updated_at)}</p>
                                                <p>Analyst: {session.analyst_name || 'Unknown'}</p>
                                            </div>
                                        </div>
                                    </div>
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

// Helper functions
function getDaysWaiting(createdAt) {
    const days = Math.floor((new Date() - new Date(createdAt)) / (1000 * 60 * 60 * 24));
    return days;
}

function getTurnaroundTime(createdAt, completedAt) {
    const hours = Math.floor((new Date(completedAt) - new Date(createdAt)) / (1000 * 60 * 60));
    return `${hours}h`;
}

function getSourceType(url) {
    if (url.includes('veo')) return '🎥 Veo';
    if (url.includes('youtube')) return '📺 YouTube';
    return '🔗 Other';
}

export default CompanyDashboard;