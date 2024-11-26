import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SessionCard from './SessionCard';
import NavBar from '../../components/ui/NavBar';
import sessionService from '../../services/sessionService';

function CompanyDashboard() {
    const navigate = useNavigate();
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('ALL'); // 'ALL', 'PENDING', 'REVIEWED'
    const [sortBy, setSortBy] = useState('date'); // 'date', 'team', 'status'

    const filteredSessions = sessions
        .filter(session => filter === 'ALL' ? true : session.status === filter)
        .sort((a, b) => {
            switch(sortBy) {
                case 'team':
                    return a.team_name.localeCompare(b.team_name);
                case 'status':
                    return a.status.localeCompare(b.status);
                default:
                    return new Date(b.created_at) - new Date(a.created_at);
            }
        });

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
        <div style={{ 
            backgroundColor: '#1a1a1a', 
            minHeight: '100vh',
            color: '#ffffff',
            paddingBottom: '80px'
        }}>
            <div className="p-5 max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl">Company Dashboard</h2>
                    <div className="flex gap-4">
                        <select 
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="bg-gray-800 text-white border border-gray-700 rounded px-3 py-1"
                        >
                            <option value="ALL">All Sessions</option>
                            <option value="PENDING">Pending</option>
                            <option value="REVIEWED">Reviewed</option>
                        </select>
                        <select 
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="bg-gray-800 text-white border border-gray-700 rounded px-3 py-1"
                        >
                            <option value="date">Sort by Date</option>
                            <option value="team">Sort by Team</option>
                            <option value="status">Sort by Status</option>
                        </select>
                    </div>
                </div>
                <div className="grid gap-4">
                    {filteredSessions.map(session => (
                        <SessionCard 
                            key={session.id}
                            session={session}
                            onUpdate={fetchSessions}
                        />
                    ))}
                </div>
            </div>
            <NavBar />
        </div>
    );
}

export default CompanyDashboard;