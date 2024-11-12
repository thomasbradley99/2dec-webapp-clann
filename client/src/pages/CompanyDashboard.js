import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import NavBar from '../components/NavBar';

function CompanyDashboard() {
    const navigate = useNavigate();
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedSession, setSelectedSession] = useState(null);
    const [analysisDescription, setAnalysisDescription] = useState('');
    const user = JSON.parse(localStorage.getItem('user'));
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    useEffect(() => {
        if (!user || user.role !== 'COMPANY_MEMBER') {
            navigate('/');
            return;
        }
        fetchSessions();
    }, [navigate, user]);

    const fetchSessions = async () => {
        try {
            const response = await axios.get('http://localhost:3001/api/sessions/all', {
                headers: { 'user-id': user.id }
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
            // Create preview URL
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
                        'user-id': user.id,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );
            
            console.log('Upload response:', response.data);
            
            // Reset form and refresh sessions
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
                            <p><strong>Status:</strong> {session.status}</p>
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
                            
                            {session.status === 'PENDING' && (
                                <button
                                    onClick={() => setSelectedSession(session.id)}
                                    style={{
                                        backgroundColor: '#1A5F7A',
                                        color: 'white',
                                        padding: '8px 16px',
                                        border: 'none',
                                        borderRadius: '4px',
                                        marginLeft: '10px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Add Analysis
                                </button>
                            )}

                            {selectedSession === session.id && (
                                <div style={{ marginTop: '15px', padding: '15px', backgroundColor: '#555555' }}>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileSelect}
                                        style={{
                                            marginBottom: '10px'
                                        }}
                                    />
                                    
                                    {previewUrl && (
                                        <div style={{ marginBottom: '10px' }}>
                                            <img 
                                                src={previewUrl} 
                                                alt="Analysis preview" 
                                                style={{
                                                    maxWidth: '200px',
                                                    maxHeight: '200px',
                                                    objectFit: 'contain'
                                                }}
                                            />
                                        </div>
                                    )}

                                    <textarea
                                        placeholder="Analysis Description"
                                        value={analysisDescription}
                                        onChange={(e) => setAnalysisDescription(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '8px',
                                            marginBottom: '10px',
                                            backgroundColor: '#666666',
                                            border: 'none',
                                            color: 'white',
                                            minHeight: '100px'
                                        }}
                                    />
                                    <button
                                        onClick={() => handleAnalysisSubmit(session.id)}
                                        style={{
                                            backgroundColor: '#016F33',
                                            color: 'white',
                                            padding: '8px 16px',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Submit Analysis
                                    </button>
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