import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import sessionService from '../services/sessionService';
import NavBar from '../components/ui/NavBar';

function SessionDetails() {
    const { sessionId } = useParams();
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSession = async () => {
            try {
                const data = await sessionService.getSessionDetails(sessionId);
                setSession(data);
            } catch (error) {
                console.error('Error fetching session:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchSession();
    }, [sessionId]);

    if (loading) return <div className="p-8 text-white">Loading...</div>;
    if (!session) return <div className="p-8 text-white">Session not found</div>;

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <div className="max-w-4xl mx-auto p-8">
                <div className="bg-gray-800 rounded-lg p-6 mb-6">
                    <h1 className="text-2xl font-bold mb-4">{session.team_name}</h1>
                    <div className="space-y-3 text-gray-300">
                        <p>Status: <span className={`font-medium ${
                            session.status === 'PENDING' ? 'text-red-400' : 'text-green-400'
                        }`}>{session.status}</span></p>
                        <p>URL: {session.footage_url}</p>
                        <p>Created: {new Date(session.created_at).toLocaleDateString()}</p>
                    </div>
                </div>

                {(session.analysis_image1_url || session.analysis_image2_url || session.analysis_image3_url) && (
                    <div className="space-y-6">
                        {session.analysis_image1_url && (
                            <div className="bg-gray-800 rounded-lg p-6">
                                <h2 className="text-xl font-bold mb-4">Heatmap</h2>
                                <img 
                                    src={session.analysis_image1_url} 
                                    alt="Heatmap Analysis"
                                    className="w-full rounded-lg"
                                />
                            </div>
                        )}
                        {session.analysis_image2_url && (
                            <div className="bg-gray-800 rounded-lg p-6">
                                <h2 className="text-xl font-bold mb-4">Sprint Map</h2>
                                <img 
                                    src={session.analysis_image2_url} 
                                    alt="Sprint Map Analysis"
                                    className="w-full rounded-lg"
                                />
                            </div>
                        )}
                        {session.analysis_image3_url && (
                            <div className="bg-gray-800 rounded-lg p-6">
                                <h2 className="text-xl font-bold mb-4">Game Momentum</h2>
                                <img 
                                    src={session.analysis_image3_url} 
                                    alt="Game Momentum Analysis"
                                    className="w-full rounded-lg"
                                />
                            </div>
                        )}
                    </div>
                )}

                {session.analysis_description && (
                    <div className="bg-gray-800 rounded-lg p-6 mt-6">
                        <h2 className="text-xl font-bold mb-4">Analysis Notes</h2>
                        <p className="text-gray-300">{session.analysis_description}</p>
                    </div>
                )}
            </div>
            <NavBar />
        </div>
    );
}

export default SessionDetails; 