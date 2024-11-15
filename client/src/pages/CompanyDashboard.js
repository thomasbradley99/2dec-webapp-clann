import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import NavBar from '../components/NavBar';
import sessionService from '../services/sessionService';

const getUserFromStorage = () => JSON.parse(localStorage.getItem('user'));

function CompanyDashboard() {
    const navigate = useNavigate();
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedSession, setExpandedSession] = useState(null);
    const [analysisDescription, setAnalysisDescription] = useState('');
    const [selectedFiles, setSelectedFiles] = useState({
        heatmap: null,
        sprint_map: null,
        game_momentum: null
    });
    const [previewUrls, setPreviewUrls] = useState({
        heatmap: null,
        sprint_map: null,
        game_momentum: null
    });
    
    const user = useMemo(() => getUserFromStorage(), []);

    useEffect(() => {
        if (!user || user.role !== 'COMPANY_MEMBER') {
            navigate('/');
            return;
        }
        fetchSessions();
    }, [navigate]);

    const fetchSessions = async () => {
        try {
            const response = await axios.get('http://localhost:3001/api/sessions/all', {
                headers: { 
                    'Authorization': `Bearer ${user.token}`,
                    'user-id': user.id
                }
            });
            setSessions(response.data);
        } catch (err) {
            setError('Failed to fetch sessions');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = (event, type) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFiles(prev => ({
                ...prev,
                [type]: file
            }));
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrls(prev => ({
                    ...prev,
                    [type]: reader.result
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAnalysisSubmit = async (sessionId) => {
        const formData = new FormData();
        
        Object.entries(selectedFiles).forEach(([type, file]) => {
            if (file) {
                formData.append('analysis', file);
                formData.append('type', type);
            }
        });
        
        formData.append('sessionId', sessionId);
        formData.append('description', analysisDescription);

        try {
            const response = await sessionService.addAnalysis(formData);
            
            setSelectedFiles({
                heatmap: null,
                sprint_map: null,
                game_momentum: null
            });
            setPreviewUrls({
                heatmap: null,
                sprint_map: null,
                game_momentum: null
            });
            setAnalysisDescription('');
            setExpandedSession(null);
            await fetchSessions();
        } catch (err) {
            console.error('Upload error:', err);
            setError(err.message || 'Failed to add analysis');
        }
    };

    const handleSessionClick = (sessionId) => {
        setExpandedSession(expandedSession === sessionId ? null : sessionId);
        if (expandedSession === sessionId) {
            setSelectedFiles({
                heatmap: null,
                sprint_map: null,
                game_momentum: null
            });
            setPreviewUrls({
                heatmap: null,
                sprint_map: null,
                game_momentum: null
            });
            setAnalysisDescription('');
        }
    };

    const handleToggleStatus = async (sessionId, currentStatus) => {
        try {
            await sessionService.toggleSessionStatus(sessionId);
            fetchSessions();
        } catch (err) {
            setError('Failed to update status');
            console.error('Error:', err);
        }
    };

    const handleDeleteAnalysis = async (analysisId, type) => {
        if (!analysisId) {
            console.error(`No analysis ID provided for ${type}`);
            return;
        }

        try {
            await sessionService.deleteAnalysis(analysisId);
            await fetchSessions();
        } catch (err) {
            console.error('Delete analysis error:', err);
            setError(`Failed to delete ${type} analysis`);
        }
    };

    return (
        <div style={{ 
            backgroundColor: '#1a1a1a', 
            minHeight: '100vh',
            color: '#ffffff',
            paddingBottom: '80px'
        }}>
            <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
                <h2>Company Dashboard</h2>
                
                {loading && <p>Loading sessions...</p>}
                {error && <p style={{ color: '#FF6B35' }}>{error}</p>}

                <div style={{ display: 'grid', gap: '20px' }}>
                    {sessions.map(session => (
                        <div 
                            key={session.id} 
                            style={{
                                backgroundColor: '#333333',
                                borderRadius: '8px',
                                overflow: 'hidden'
                            }}
                        >
                            <div 
                                onClick={() => handleSessionClick(session.id)}
                                style={{
                                    padding: '20px',
                                    cursor: 'pointer'
                                }}
                            >
                                <div>
                                    <h3 style={{ margin: '0 0 10px 0' }}>{session.team_name}</h3>
                                    <p style={{ margin: '0', color: '#888' }}>
                                        Uploaded by {session.uploaded_by_email} on {new Date(session.created_at).toLocaleDateString()}
                                    </p>
                                    <p style={{ margin: '5px 0 0 0', color: '#888' }}>
                                        URL: {session.footage_url}
                                    </p>
                                </div>
                                <div style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'space-between',
                                    marginTop: '10px'
                                }}>
                                    <span style={{ 
                                        color: session.status === 'PENDING' ? '#ff4444' : '#4CAF50',
                                        fontWeight: 'bold'
                                    }}>
                                        {session.status}
                                    </span>
                                    <span style={{ transform: expandedSession === session.id ? 'rotate(180deg)' : 'none' }}>
                                        ▼
                                    </span>
                                </div>
                            </div>

                            {expandedSession === session.id && (
                                <div style={{ padding: '20px' }}>
                                    <a 
                                        href={session.footage_url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        style={{ 
                                            color: '#86C6E3',
                                            display: 'inline-block',
                                            marginBottom: '20px'
                                        }}
                                    >
                                        📹 Game Footage
                                    </a>

                                    <div style={{ marginBottom: '20px' }}>
                                        <h4>ANALYSIS</h4>
                                        <div style={{ 
                                            backgroundColor: '#444444',
                                            padding: '20px',
                                            borderRadius: '4px'
                                        }}>
                                            {/* Heatmap Section */}
                                            <h5 style={{ color: '#86C6E3', marginBottom: '15px' }}>Heatmap</h5>
                                            <div style={{ 
                                                backgroundColor: '#333333',
                                                padding: '20px',
                                                borderRadius: '4px',
                                                position: 'relative'
                                            }}>
                                                {previewUrls.heatmap ? (
                                                    <>
                                                        <div style={{ position: 'absolute', right: '20px', top: '20px' }}>
                                                            <button
                                                                onClick={() => handleDeleteAnalysis(
                                                                    session.analyses?.find(a => a.type === 'heatmap')?.id,
                                                                    'heatmap'
                                                                )}
                                                                style={{
                                                                    backgroundColor: '#FF4444',
                                                                    color: 'white',
                                                                    border: 'none',
                                                                    borderRadius: '4px',
                                                                    padding: '5px 10px',
                                                                    cursor: 'pointer',
                                                                    marginRight: '10px'
                                                                }}
                                                            >
                                                                Remove
                                                            </button>
                                                            <label style={{
                                                                backgroundColor: '#1A5F7A',
                                                                color: 'white',
                                                                border: 'none',
                                                                borderRadius: '4px',
                                                                padding: '5px 10px',
                                                                cursor: 'pointer'
                                                            }}>
                                                                Replace
                                                                <input
                                                                    type="file"
                                                                    accept="image/*"
                                                                    onChange={(e) => handleFileSelect(e, 'heatmap')}
                                                                    style={{ display: 'none' }}
                                                                />
                                                            </label>
                                                        </div>
                                                        <img 
                                                            src={previewUrls.heatmap} 
                                                            alt="Heatmap Preview" 
                                                            style={{ 
                                                                width: '100%',
                                                                maxWidth: '500px',
                                                                borderRadius: '4px'
                                                            }} 
                                                        />
                                                    </>
                                                ) : session.analyses?.find(a => a.type === 'heatmap') ? (
                                                    <>
                                                        <div style={{ position: 'absolute', right: '20px', top: '20px' }}>
                                                            <button
                                                                onClick={() => handleDeleteAnalysis(
                                                                    session.analyses.find(a => a.type === 'heatmap').id,
                                                                    'heatmap'
                                                                )}
                                                                style={{
                                                                    backgroundColor: '#FF4444',
                                                                    color: 'white',
                                                                    border: 'none',
                                                                    borderRadius: '4px',
                                                                    padding: '5px 10px',
                                                                    cursor: 'pointer',
                                                                    marginRight: '10px'
                                                                }}
                                                            >
                                                                Remove
                                                            </button>
                                                            <label style={{
                                                                backgroundColor: '#1A5F7A',
                                                                color: 'white',
                                                                border: 'none',
                                                                borderRadius: '4px',
                                                                padding: '5px 10px',
                                                                cursor: 'pointer'
                                                            }}>
                                                                Replace
                                                                <input
                                                                    type="file"
                                                                    accept="image/*"
                                                                    onChange={(e) => handleFileSelect(e, 'heatmap')}
                                                                    style={{ display: 'none' }}
                                                                />
                                                            </label>
                                                        </div>
                                                        <img 
                                                            src={`http://localhost:3001${session.analyses.find(a => a.type === 'heatmap').image_url}`}
                                                            alt="Heatmap" 
                                                            style={{ 
                                                                width: '100%',
                                                                maxWidth: '500px',
                                                                borderRadius: '4px'
                                                            }} 
                                                        />
                                                    </>
                                                ) : (
                                                    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                                                        <label style={{
                                                            backgroundColor: '#1A5F7A',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '4px',
                                                            padding: '10px 20px',
                                                            cursor: 'pointer'
                                                        }}>
                                                            Upload New Image
                                                            <input
                                                                type="file"
                                                                accept="image/*"
                                                                onChange={(e) => handleFileSelect(e, 'heatmap')}
                                                                style={{ display: 'none' }}
                                                            />
                                                        </label>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Sprint Map Section */}
                                            <h5 style={{ color: '#86C6E3', marginTop: '30px', marginBottom: '15px' }}>Sprint Map</h5>
                                            <div style={{ 
                                                backgroundColor: '#333333',
                                                padding: '20px',
                                                borderRadius: '4px',
                                                position: 'relative'
                                            }}>
                                                {session.analyses?.find(a => a.type === 'sprint_map') ? (
                                                    <>
                                                        <div style={{ position: 'absolute', right: '20px', top: '20px' }}>
                                                            <button
                                                                onClick={() => handleDeleteAnalysis(
                                                                    session.analyses.find(a => a.type === 'sprint_map').id,
                                                                    'sprint_map'
                                                                )}
                                                                style={{
                                                                    backgroundColor: '#FF4444',
                                                                    color: 'white',
                                                                    border: 'none',
                                                                    borderRadius: '4px',
                                                                    padding: '5px 10px',
                                                                    cursor: 'pointer',
                                                                    marginRight: '10px'
                                                                }}
                                                            >
                                                                Remove
                                                            </button>
                                                            <label style={{
                                                                backgroundColor: '#1A5F7A',
                                                                color: 'white',
                                                                border: 'none',
                                                                borderRadius: '4px',
                                                                padding: '5px 10px',
                                                                cursor: 'pointer'
                                                            }}>
                                                                Replace
                                                                <input
                                                                    type="file"
                                                                    accept="image/*"
                                                                    onChange={(e) => handleFileSelect(e, 'sprint_map')}
                                                                    style={{ display: 'none' }}
                                                                />
                                                            </label>
                                                        </div>
                                                        <img 
                                                            src={`http://localhost:3001${session.analyses.find(a => a.type === 'sprint_map').image_url}`}
                                                            alt="Sprint Map" 
                                                            style={{ 
                                                                width: '100%',
                                                                maxWidth: '500px',
                                                                borderRadius: '4px',
                                                                marginBottom: '20px'
                                                            }} 
                                                        />
                                                    </>
                                                ) : (
                                                    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                                                        <label style={{
                                                            backgroundColor: '#1A5F7A',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '4px',
                                                            padding: '10px 20px',
                                                            cursor: 'pointer'
                                                        }}>
                                                            Upload Sprint Map
                                                            <input
                                                                type="file"
                                                                accept="image/*"
                                                                onChange={(e) => handleFileSelect(e, 'sprint_map')}
                                                                style={{ display: 'none' }}
                                                            />
                                                        </label>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Game Momentum Section */}
                                            <h5 style={{ color: '#86C6E3', marginTop: '30px', marginBottom: '15px' }}>Game Momentum</h5>
                                            <div style={{ 
                                                backgroundColor: '#333333',
                                                padding: '20px',
                                                borderRadius: '4px',
                                                position: 'relative'
                                            }}>
                                                {session.analyses?.find(a => a.type === 'game_momentum') ? (
                                                    <>
                                                        <div style={{ position: 'absolute', right: '20px', top: '20px' }}>
                                                            <button
                                                                onClick={() => handleDeleteAnalysis(
                                                                    session.analyses.find(a => a.type === 'game_momentum').id,
                                                                    'game_momentum'
                                                                )}
                                                                style={{
                                                                    backgroundColor: '#FF4444',
                                                                    color: 'white',
                                                                    border: 'none',
                                                                    borderRadius: '4px',
                                                                    padding: '5px 10px',
                                                                    cursor: 'pointer',
                                                                    marginRight: '10px'
                                                                }}
                                                            >
                                                                Remove
                                                            </button>
                                                            <label style={{
                                                                backgroundColor: '#1A5F7A',
                                                                color: 'white',
                                                                border: 'none',
                                                                borderRadius: '4px',
                                                                padding: '5px 10px',
                                                                cursor: 'pointer'
                                                            }}>
                                                                Replace
                                                                <input
                                                                    type="file"
                                                                    accept="image/*"
                                                                    onChange={(e) => handleFileSelect(e, 'game_momentum')}
                                                                    style={{ display: 'none' }}
                                                                />
                                                            </label>
                                                        </div>
                                                        <img 
                                                            src={`http://localhost:3001${session.analyses.find(a => a.type === 'game_momentum').image_url}`}
                                                            alt="Game Momentum" 
                                                            style={{ 
                                                                width: '100%',
                                                                maxWidth: '500px',
                                                                borderRadius: '4px',
                                                                marginBottom: '20px'
                                                            }} 
                                                        />
                                                    </>
                                                ) : (
                                                    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                                                        <label style={{
                                                            backgroundColor: '#1A5F7A',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '4px',
                                                            padding: '10px 20px',
                                                            cursor: 'pointer'
                                                        }}>
                                                            Upload Game Momentum
                                                            <input
                                                                type="file"
                                                                accept="image/*"
                                                                onChange={(e) => handleFileSelect(e, 'game_momentum')}
                                                                style={{ display: 'none' }}
                                                            />
                                                        </label>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Preview section for all types */}
                                            {Object.entries(previewUrls).map(([type, url]) => url && (
                                                <div key={type}>
                                                    <h5 style={{ color: '#86C6E3', marginTop: '20px', marginBottom: '15px' }}>
                                                        {type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} Preview
                                                    </h5>
                                                    <img 
                                                        src={url} 
                                                        alt={`${type} Preview`}
                                                        style={{ 
                                                            width: '100%',
                                                            maxWidth: '500px',
                                                            borderRadius: '4px',
                                                            marginBottom: '20px'
                                                        }} 
                                                    />
                                                </div>
                                            ))}

                                            <div>
                                                <p style={{ marginBottom: '10px', color: '#888' }}>Description:</p>
                                                <textarea
                                                    value={analysisDescription || (session.analyses?.[0]?.description || '')}
                                                    onChange={(e) => setAnalysisDescription(e.target.value)}
                                                    style={{
                                                        width: '100%',
                                                        padding: '10px',
                                                        backgroundColor: '#333333',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '4px',
                                                        minHeight: '80px',
                                                        marginBottom: '15px'
                                                    }}
                                                />
                                            </div>

                                            {session.analyses?.[0] && (
                                                <p style={{ color: '#888', margin: '10px 0' }}>
                                                    Analyst: {session.analyses[0].analyst_email}
                                                </p>
                                            )}

                                            {(selectedFiles.heatmap || analysisDescription !== session.analyses?.[0]?.description) && (
                                                <button
                                                    onClick={() => handleAnalysisSubmit(session.id)}
                                                    style={{
                                                        backgroundColor: '#1A5F7A',
                                                        color: 'white',
                                                        padding: '10px 20px',
                                                        border: 'none',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer',
                                                        marginTop: '10px'
                                                    }}
                                                >
                                                    Save Changes
                                                </button>
                                            )}

                                            <button
                                                onClick={() => handleToggleStatus(session.id, session.status)}
                                                style={{
                                                    backgroundColor: session.status === 'PENDING' ? '#4CAF50' : '#FF4444',
                                                    color: 'white',
                                                    padding: '10px 20px',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    marginTop: '20px',
                                                    width: '100%'
                                                }}
                                            >
                                                Toggle Status: {session.status === 'PENDING' ? 'PENDING ⇄ REVIEWED' : 'REVIEWED ⇄ PENDING'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
            <NavBar />
        </div>
    );
}

export default CompanyDashboard;