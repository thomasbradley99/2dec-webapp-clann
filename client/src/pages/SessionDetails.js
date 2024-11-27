import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import sessionService from '../services/sessionService';
import NavBar from '../components/ui/NavBar';

function SessionDetails() {
    const { sessionId } = useParams();
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSession = async () => {
            try {
                const data = await sessionService.getSessionDetails(sessionId);
                console.log("Fetched session data:", data);
                setSession(data);
            } catch (error) {
                console.error('Error fetching session:', error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchSession();
    }, [sessionId]);

    if (loading) return <div className="p-8 text-white">Loading...</div>;
    if (error) return <div className="p-8 text-white">Error: {error}</div>;
    if (!session) return <div className="p-8 text-white">Session not found</div>;

    return (
        <div className="min-h-screen bg-gray-900 text-white pb-20">
            <div className="max-w-7xl mx-auto p-8">
                {/* Header Section */}
                <div className="bg-gray-800/50 rounded-xl p-6 mb-8">
                    <h1 className="text-4xl font-bold mb-4">{session.team_name}</h1>
                    <div className="flex flex-wrap items-center gap-4">
                        <span className={`px-4 py-1.5 rounded-full text-sm font-medium flex items-center gap-2 
                            ${session.status === 'PENDING' 
                                ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' 
                                : 'bg-green-500/20 text-green-400 border border-green-500/30'}`}>
                            ⚡️ {session.status}
                        </span>
                        <span className="text-gray-400 flex items-center gap-2">
                            📅 {new Date(session.game_date).toLocaleDateString()}
                        </span>
                        <span className="text-gray-400 flex items-center gap-2">
                            👤 {session.uploaded_by_email}
                        </span>
                    </div>
                </div>

                {/* Performance Metrics Section */}
                {session.team_metrics && (
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold mb-6">PERFORMANCE METRICS</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {Object.entries(session.team_metrics)
                                .filter(([key]) => key !== 'high_intensity_sprints')
                                .map(([key, value]) => (
                                    <div key={key} 
                                        className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50 
                                                 hover:border-green-500/30 transition-colors">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="text-2xl">
                                                {key.includes('sprint') ? '⚡️' : 
                                                 key.includes('distance') ? '📏' : 
                                                 key.includes('speed') ? '🚀' : '📊'}
                                            </span>
                                            <h3 className="text-sm font-medium text-gray-400">
                                                {key.split('_').map(word => 
                                                    word.charAt(0).toUpperCase() + word.slice(1)
                                                ).join(' ')}
                                            </h3>
                                        </div>
                                        <p className="text-3xl font-bold">
                                            {value}
                                            {key.includes('speed') ? ' km/h' : 
                                             key.includes('distance') ? 'm' : ''}
                                        </p>
                                    </div>
                                ))}
                        </div>
                    </div>
                )}

                {/* AI Analysis Section */}
                {(session.analysis_image1_url || session.analysis_image2_url || session.analysis_image3_url) && (
                    <div>
                        <h2 className="text-2xl font-bold mb-6">AI ANALYSIS</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                { type: 'HEATMAP', icon: '🔥', url: session.analysis_image1_url },
                                { type: 'SPRINT MAP', icon: '⚡', url: session.analysis_image2_url },
                                { type: 'GAME MOMENTUM', icon: '📈', url: session.analysis_image3_url }
                            ].map(analysis => analysis.url && (
                                <div key={analysis.type} 
                                    className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 
                                             hover:border-green-500/30 transition-colors">
                                    <div className="flex items-center gap-3 mb-4">
                                        <span className="text-2xl">{analysis.icon}</span>
                                        <h3 className="text-xl font-bold">{analysis.type}</h3>
                                    </div>
                                    <img 
                                        src={analysis.url} 
                                        alt={`${analysis.type} Analysis`}
                                        className="w-full rounded-lg object-contain bg-black/30"
                                        style={{ maxHeight: '300px' }}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            <NavBar />
        </div>
    );
}

export default SessionDetails; 