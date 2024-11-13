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
    const [selectedSession, setSelectedSession] = useState(null);
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
            setSelectedSession(null);
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

    const handleToggleStatus = async (sessionId) => {
        try {
            const updatedSession = await sessionService.toggleSessionStatus(sessionId);
            
            setSessions(prevSessions => prevSessions.map(session => 
                session.id === sessionId 
                    ? { ...session, status: updatedSession.status }
                    : session
            ));
        } catch (error) {
            console.error('Error toggling status:', error);
            alert('Failed to toggle status: ' + error.message);
        }
    };

    return (
        <div style={{ 
            backgroundColor: '#1a1a1a', 
            minHeight: '100vh',
            color: '#ffffff',
            paddingBottom: '80px'
        }}>
            <div style={{ padding: '20px' }}>
                <h2>Company Dashboard</h2>
                
                {loading && <p>Loading sessions...</p>}
                {error && <p style={{ color: '#FF6B35' }}>{error}</p>}

                {selectedSession && (
                    <div style={{
                        backgroundColor: '#333333',
                        padding: '20px',
                        borderRadius: '8px',
                        marginBottom: '20px'
                    }}>
                        <h3>Add Analysis</h3>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileSelect}
                            style={{ marginBottom: '10px' }}
                        />
                        {previewUrl && (
                            <img 
                                src={previewUrl} 
                                alt="Preview" 
                                style={{ 
                                    maxWidth: '300px', 
                                    marginBottom: '10px',
                                    display: 'block'
                                }} 
                            />
                        )}
                        <textarea
                            value={analysisDescription}
                            onChange={(e) => setAnalysisDescription(e.target.value)}
                            placeholder="Analysis description..."
                            style={{
                                width: '100%',
                                padding: '8px',
                                marginBottom: '10px',
                                backgroundColor: '#444444',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px'
                            }}
                        />
                        <div>
                            <button
                                onClick={() => handleAnalysisSubmit(selectedSession)}
                                style={{
                                    backgroundColor: '#1A5F7A',
                                    color: 'white',
                                    padding: '8px 16px',
                                    border: 'none',
                                    borderRadius: '4px',
                                    marginRight: '10px',
                                    cursor: 'pointer'
                                }}
                            >
                                Submit Analysis
                            </button>
                            <button
                                onClick={() => {
                                    setSelectedSession(null);
                                    setSelectedFile(null);
                                    setPreviewUrl(null);
                                    setAnalysisDescription('');
                                }}
                                style={{
                                    backgroundColor: '#444444',
                                    color: 'white',
                                    padding: '8px 16px',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
                
                <div style={{ 
                    backgroundColor: '#333333', 
                    padding: '20px', 
                    borderRadius: '8px',
                    marginTop: '20px'
                }}>
                    <h3>All Sessions</h3>
                    {sessions.map(session => (
                        <div 
                            key={session.id} 
                            style={{
                                backgroundColor: '#444444',
                                padding: '15px',
                                marginBottom: '10px',
                                borderRadius: '4px'
                            }}
                        >
                            <p><strong>Team:</strong> {session.team_name}</p>
                            <p>
                                <strong>Status:</strong> {session.status}
                                <button 
                                    onClick={() => handleToggleStatus(session.id)}
                                    style={{
                                        marginLeft: '10px',
                                        padding: '5px 10px',
                                        backgroundColor: session.status === 'PENDING' ? '#4CAF50' : '#f44336',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Toggle Status
                                </button>
                            </p>
                            <p><strong>Uploaded By:</strong> {session.uploaded_by_email}</p>
                            <p><strong>Date:</strong> {new Date(session.created_at).toLocaleDateString()}</p>
                            <a 
                                href={session.footage_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                style={{ color: '#86C6E3' }}
                            >
                                View Footage
                            </a>

                            {session.analyses && session.analyses.length > 0 && (
                                <div style={{ marginTop: '15px' }}>
                                    <h4>Analyses:</h4>
                                    {session.analyses.map(analysis => (
                                        <div key={analysis.id} style={{ 
                                            marginBottom: '10px', 
                                            padding: '10px', 
                                            backgroundColor: '#555555',
                                            borderRadius: '4px'
                                        }}>
                                            <img 
                                                src={analysis.image_url} 
                                                alt="Analysis" 
                                                style={{ 
                                                    maxWidth: '100%', 
                                                    marginBottom: '10px',
                                                    borderRadius: '4px'
                                                }} 
                                            />
                                            <p><strong>Description:</strong> {analysis.description}</p>
                                            <p><strong>Analyst:</strong> {analysis.analyst_email}</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {session.status === 'PENDING' && (
                                <button
                                    onClick={() => setSelectedSession(session.id)}
                                    style={{
                                        backgroundColor: '#1A5F7A',
                                        color: 'white',
                                        padding: '8px 16px',
                                        border: 'none',
                                        borderRadius: '4px',
                                        marginTop: '10px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Add Analysis
                                </button>
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