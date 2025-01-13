import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import sessionService from '../services/sessionService';
import NavBar from '../components/ui/NavBar';
import Header from '../components/ui/Header';

function SessionDetails() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSession = async () => {
            try {
                const data = await sessionService.getSessionDetails(id);
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
    }, [id]);

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this session? This action cannot be undone.')) {
            try {
                await sessionService.deleteSession(id);
                navigate('/sessions');
            } catch (err) {
                console.error('Error deleting session:', err);
            }
        }
    };

    if (loading) return <div className="p-8 text-white">Loading...</div>;
    if (error) return <div className="p-8 text-white">Error: {error}</div>;
    if (!session) return <div className="p-8 text-white">Session not found</div>;

    return (
        <div className="min-h-screen bg-gray-900">
            <div className="relative min-h-screen">
                <Header />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
                    {/* Header with View Footage */}
                    <div className="flex justify-between items-start mb-12">
                        <div className="text-center lg:text-left">
                            <h1 className="text-4xl font-display text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-400 to-blue-500">
                                {session.team_name}
                            </h1>
                            <p className="text-xl text-gray-200 mt-4">
                                {new Date(session.game_date).toLocaleDateString()}
                            </p>
                        </div>
                        <a href={session.footage_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-green-500/10 text-green-400 border border-green-500/30 
                                    px-6 py-3 rounded-xl hover:bg-green-500/20 transition-all">
                            View Game Footage
                        </a>
                    </div>

                    {/* Performance Metrics */}
                    {session.team_metrics && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
                            {Object.entries(session.team_metrics)
                                .filter(([key]) => key !== 'high_intensity_sprints')
                                .sort(([keyA], [keyB]) => {
                                    const order = ['total_distance', 'sprint_distance', 'total_sprints', 'top_sprint_speed'];
                                    return order.indexOf(keyA) - order.indexOf(keyB);
                                })
                                .map(([key, value]) => (
                                    <div key={key} className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                                        <div className="flex items-center gap-3 mb-3">
                                            <span className="text-2xl">
                                                {key === 'total_distance' ? '📏' :
                                                    key === 'sprint_distance' ? '⚡️' :
                                                        key === 'total_sprints' ? '🏃' : '🚀'}
                                            </span>
                                            <h3 className="text-sm text-gray-300">
                                                {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                            </h3>
                                        </div>
                                        <div className="text-2xl font-bold text-white">
                                            {value}
                                            {key === 'sprint_distance' ? ' m' :
                                                key === 'total_distance' ? ' km' :
                                                    key === 'top_sprint_speed' ? ' m/s' : ''}
                                        </div>
                                    </div>
                                ))}
                        </div>
                    )}

                    {/* AI Analysis */}
                    {(session.analysis_image1_url || session.analysis_image2_url || session.analysis_image3_url) && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                            {[
                                { type: 'HEATMAP', icon: '🔥', url: session.analysis_image1_url },
                                { type: 'SPRINT MAP', icon: '⚡', url: session.analysis_image2_url },
                                { type: 'GAME MOMENTUM', icon: '📈', url: session.analysis_image3_url }
                            ].map(analysis => analysis.url && (
                                <div key={analysis.type}
                                    className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 hover:border-blue-500/30 transition-all">
                                    <div className="flex items-center gap-3 mb-4">
                                        <span className="text-2xl">{analysis.icon}</span>
                                        <h3 className="text-xl text-white">{analysis.type}</h3>
                                    </div>
                                    <img src={analysis.url}
                                        alt={analysis.type}
                                        className="w-full h-auto object-contain rounded-lg bg-black/30" />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Video Highlights */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                        {[1, 2, 3, 4, 5].map(index => {
                            const videoUrl = session[`analysis_video${index}_url`];
                            return videoUrl && (
                                <div key={index}
                                    className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 hover:border-purple-500/30 
                                              transition-all transform hover:-translate-y-1">
                                    <div className="flex items-center gap-3 mb-4">
                                        <span className="text-2xl">🎬</span>
                                        <h3 className="text-xl text-white">Highlight {index}</h3>
                                    </div>
                                    <div className="bg-black/30 rounded-lg overflow-hidden">
                                        <video controls className="w-full h-auto">
                                            <source src={videoUrl} type="video/mp4" />
                                            Your browser does not support the video tag.
                                        </video>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Delete button moved above NavBar */}
                    <div className="flex justify-center pb-20 pt-8">
                        <button onClick={handleDelete}
                            className="bg-red-500/10 text-red-400 border border-red-500/30 
                                         px-6 py-3 rounded-xl hover:bg-red-500/20 transition-all">
                            Delete Session
                        </button>
                    </div>
                </div>
                <NavBar />
            </div>
        </div>
    );
}

export default SessionDetails; 