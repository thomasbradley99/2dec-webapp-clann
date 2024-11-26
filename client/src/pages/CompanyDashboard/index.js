import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import SessionList from './components/SessionList';
import AnalysisModal from './components/AnalysisModal';
import NavBar from '../../components/common/NavBar';
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
        // Implementation needed
    };

    const handleModalClose = () => {
        // Implementation needed
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

    const handleError = (errorMessage) => {
        setError(errorMessage);
        // Optionally close the modal
        setIsModalOpen(false);
    };

    if (loading) return <div className="p-5">Loading sessions...</div>;
    if (error) return <div className="p-5 text-red-500">{error}</div>;

    return (
        <div className="bg-dark min-h-screen text-white pb-20">
            <div className="p-5 max-w-7xl mx-auto">
                <h2 className="text-2xl mb-6">Company Dashboard</h2>
                
                {error && (
                    <div className="error-message mb-4 p-3 bg-red-600 text-white rounded">
                        {error}
                    </div>
                )}
                
                <SessionList 
                    sessions={sessions}
                    onSessionClick={(session) => {
                        setSelectedSession(session);
                        setIsModalOpen(true);
                    }}
                    onStatusToggle={handleStatusToggle}
                />

                {isModalOpen && selectedSession && (
                    <AnalysisModal
                        session={selectedSession}
                        onClose={() => {
                            setIsModalOpen(false);
                            setSelectedSession(null);
                            fetchSessions(); // Refresh after close
                        }}
                        onError={handleError}
                    />
                )}
            </div>
            <NavBar />
        </div>
    );
}

export default CompanyDashboard; 