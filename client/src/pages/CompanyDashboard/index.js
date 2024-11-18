import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import SessionList from './components/SessionList';
import AnalysisModal from './components/AnalysisModal';
import NavBar from '../../components/NavBar';
import sessionService from '../../services/sessionService';

const getUserFromStorage = () => JSON.parse(localStorage.getItem('user'));

function CompanyDashboard() {
    const navigate = useNavigate();
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedSession, setSelectedSession] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const user = useMemo(() => getUserFromStorage(), []);

    const fetchSessions = async () => {
        try {
            const data = await sessionService.getAllSessions();
            setSessions(data);
        } catch (err) {
            setError('Failed to fetch sessions');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!user || user.role !== 'COMPANY_MEMBER') {
            navigate('/');
            return;
        }
        fetchSessions();
    }, [navigate, user]);

    const handleSessionClick = (session) => {
        setSelectedSession(session);
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setSelectedSession(null);
        fetchSessions(); // Refresh list after modal closes
    };

    const handleStatusToggle = async (sessionId) => {
        try {
            await sessionService.toggleSessionStatus(sessionId);
            fetchSessions(); // Refresh the list
        } catch (err) {
            setError('Failed to update status');
            console.error('Error:', err);
        }
    };

    if (loading) return <div className="p-5">Loading sessions...</div>;
    if (error) return <div className="p-5 text-red-500">{error}</div>;

    return (
        <div className="bg-dark min-h-screen text-white pb-20">
            <div className="p-5 max-w-7xl mx-auto">
                <h2 className="text-2xl mb-6">Company Dashboard</h2>
                
                <SessionList 
                    sessions={sessions}
                    onSessionClick={handleSessionClick}
                    onStatusToggle={handleStatusToggle}
                />

                {isModalOpen && selectedSession && (
                    <AnalysisModal
                        session={selectedSession}
                        onClose={handleModalClose}
                        onError={setError}
                    />
                )}
            </div>
            <NavBar />
        </div>
    );
}

export default CompanyDashboard; 