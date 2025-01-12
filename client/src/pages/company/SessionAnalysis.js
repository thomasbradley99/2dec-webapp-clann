import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import sessionService from '../../services/sessionService';
import TeamMetricsForm from '../../components/TeamMetricsForm';

function SessionAnalysis() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [session, setSession] = useState(null);
    const [uploading, setUploading] = useState({});

    useEffect(() => {
        fetchSession();
    }, [id]);

    const fetchSession = async () => {
        try {
            const data = await sessionService.getSessionDetails(id);
            setSession(data);
        } catch (err) {
            console.error('Failed to fetch session:', err);
        }
    };

    const handleFileUpload = async (type) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = type.startsWith('VIDEO') ? 'video/*' : 'image/*';

        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            setUploading(prev => ({ ...prev, [type]: true }));
            try {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('sessionId', session.id);
                formData.append('type', type);

                await sessionService.addAnalysis(formData);
                fetchSession();
            } catch (err) {
                console.error('Upload failed:', err);
            } finally {
                setUploading(prev => ({ ...prev, [type]: false }));
            }
        };
        input.click();
    };

    if (!session) return <div>Loading...</div>;

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-8">
            <div className="mb-6">
                <button
                    onClick={() => navigate('/company/dashboard')}
                    className="text-blue-400 hover:underline"
                >
                    ← Back to Dashboard
                </button>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg mb-8">
                <h2 className="text-2xl font-bold mb-4">{session.team_name}</h2>
                <div className="text-sm text-gray-400 space-y-2">
                    <p>Uploaded: {new Date(session.created_at).toLocaleDateString()}</p>
                    <p>Source: {new URL(session.footage_url).hostname}</p>
                    <p>
                        <a href={session.footage_url} target="_blank" rel="noopener noreferrer"
                            className="text-blue-400 hover:underline">
                            View Game Footage
                        </a>
                    </p>
                </div>
            </div>

            <div className="grid gap-6">
                <div>
                    <h3 className="text-xl font-bold mb-4">Analysis Images</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {['HEATMAP', 'SPRINT_MAP', 'GAME_MOMENTUM'].map(type => (
                            <div key={type} className="bg-gray-800 p-4 rounded-lg">
                                <h4 className="text-lg mb-4">{type.replace('_', ' ')}</h4>
                                {session[`analysis_image${type === 'HEATMAP' ? '1' : type === 'SPRINT_MAP' ? '2' : '3'}_url`] ? (
                                    <img
                                        src={session[`analysis_image${type === 'HEATMAP' ? '1' : type === 'SPRINT_MAP' ? '2' : '3'}_url`]}
                                        alt={type}
                                        className="w-full rounded-lg"
                                    />
                                ) : (
                                    <button
                                        onClick={() => handleFileUpload(type)}
                                        disabled={uploading[type]}
                                        className="w-full p-4 border-2 border-dashed border-gray-600 rounded"
                                    >
                                        {uploading[type] ? 'Uploading...' : `Upload ${type.replace('_', ' ')}`}
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <h3 className="text-xl font-bold mb-4">Video Analysis</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[1, 2, 3, 4, 5].map(index => (
                            <div key={index} className="bg-gray-800 p-4 rounded-lg">
                                <h4 className="text-lg mb-4">Video {index}</h4>
                                {session[`analysis_video${index}_url`] ? (
                                    <video controls className="w-full rounded-lg">
                                        <source src={session[`analysis_video${index}_url`]} type="video/mp4" />
                                    </video>
                                ) : (
                                    <button
                                        onClick={() => handleFileUpload(`VIDEO_${index}`)}
                                        disabled={uploading[`VIDEO_${index}`]}
                                        className="w-full p-4 border-2 border-dashed border-gray-600 rounded"
                                    >
                                        {uploading[`VIDEO_${index}`] ? 'Uploading...' : `Upload Video ${index}`}
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <TeamMetricsForm session={session} onUpdate={fetchSession} />
            </div>
        </div>
    );
}

export default SessionAnalysis; 