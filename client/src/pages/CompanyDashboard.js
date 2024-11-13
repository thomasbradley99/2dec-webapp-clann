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
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    
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

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAnalysisSubmit = async (sessionId) => {
        if (!selectedFile) {
            setError('Please select an image');
            return;
        }

        const formData = new FormData();
        formData.append('analysis', selectedFile);
        formData.append('sessionId', sessionId);
        formData.append('description', analysisDescription);

        try {
            console.log('Sending analysis:', {
                sessionId,
                fileSize: selectedFile.size,
                fileName: selectedFile.name
            });
            
            const response = await axios.post(
                'http://localhost:3001/api/sessions/analysis', 
                formData,
                {
                    headers: { 
                        'Authorization': `Bearer ${user.token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );
            
            console.log('Upload response:', response.data);
            
            setSelectedFile(null);
            setPreviewUrl(null);
            setAnalysisDescription('');
            setExpandedSession(null);
            fetchSessions();
        } catch (err) {
            console.error('Upload error details:', {
                message: err.message,
                response: err.response?.data,
                status: err.response?.status
            });
            setError(err.response?.data?.error || 'Failed to add analysis');
        }
    };

    const handleSessionClick = (sessionId) => {
        setExpandedSession(expandedSession === sessionId ? null : sessionId);
        if (expandedSession === sessionId) {
            setSelectedFile(null);
            setPreviewUrl(null);
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

    const handleDeleteAnalysis = async (analysisId) => {
        if (window.confirm('Are you sure you want to delete this analysis?')) {
            try {
                await sessionService.deleteAnalysis(analysisId);
                fetchSessions();
            } catch (err) {
                setError('Failed to delete analysis');
                console.error('Error:', err);
            }
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

                <div style={{ 
                    display: 'grid',
                    gap: '20px',
                }}>
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
                                    cursor: 'pointer',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    borderBottom: expandedSession === session.id ? '1px solid #444' : 'none'
                                }}
                            >
                                <div>
                                    <h3 style={{ margin: '0 0 10px 0' }}>{session.team_name}</h3>
                                    <p style={{ margin: '0', color: '#888' }}>
                                        Uploaded by {session.uploaded_by_email} on {new Date(session.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
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
                                            borderRadius: '4px',
                                            position: 'relative'
                                        }}>
                                            {session.analyses && session.analyses.length > 0 ? (
                                                <>
                                                    <div style={{ position: 'absolute', right: '20px', top: '20px' }}>
                                                        <button
                                                            onClick={() => handleDeleteAnalysis(session.analyses[0].id)}
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
                                                        <label
                                                            style={{
                                                                backgroundColor: '#1A5F7A',
                                                                color: 'white',
                                                                border: 'none',
                                                                borderRadius: '4px',
                                                                padding: '5px 10px',
                                                                cursor: 'pointer'
                                                            }}
                                                        >
                                                            Replace
                                                            <input
                                                                type="file"
                                                                accept="image/*"
                                                                onChange={handleFileSelect}
                                                                style={{ display: 'none' }}
                                                            />
                                                        </label>
                                                    </div>
                                                    <img 
                                                        src={`http://localhost:3001${session.analyses[0].image_url}`} 
                                                        alt="Heatmap" 
                                                        style={{ 
                                                            width: '100%',
                                                            maxWidth: '500px',
                                                            borderRadius: '4px',
                                                            marginBottom: '20px'
                                                        }} 
                                                    />
                                                </>
                                            ) : (
                                                <div style={{ 
                                                    textAlign: 'center', 
                                                    padding: '40px 20px' 
                                                }}>
                                                    <label
                                                        style={{
                                                            backgroundColor: '#1A5F7A',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '4px',
                                                            padding: '10px 20px',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        Upload New Image
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={handleFileSelect}
                                                            style={{ display: 'none' }}
                                                        />
                                                    </label>
                                                </div>
                                            )}

                                            {previewUrl && (
                                                <img 
                                                    src={previewUrl} 
                                                    alt="Preview" 
                                                    style={{ 
                                                        width: '100%',
                                                        maxWidth: '500px',
                                                        borderRadius: '4px',
                                                        marginBottom: '20px'
                                                    }} 
                                                />
                                            )}

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

                                            {(selectedFile || analysisDescription !== session.analyses?.[0]?.description) && (
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