import React, { useState } from 'react';
import sessionService from '../../../services/sessionService';

function SessionCard({ session, onStatusToggle, onError }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [uploading, setUploading] = useState(false);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString();
    };

    const handleFileSelect = async (type) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            setUploading(true);
            try {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('sessionId', session.id);
                formData.append('type', type);
                
                await sessionService.addAnalysis(formData);
                // Refresh the parent component
                window.location.reload();
            } catch (err) {
                onError(err.message || 'Upload failed');
            } finally {
                setUploading(false);
            }
        };

        input.click();
    };

    return (
        <div 
            style={{
                padding: '15px',
                marginBottom: '10px',
                backgroundColor: '#1a1a1a',
                borderRadius: '4px',
                border: '1px solid #333',
                position: 'relative',
                cursor: 'pointer'
            }}
            onClick={() => setIsExpanded(!isExpanded)}
        >
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onStatusToggle(session.id);
                }}
                style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    backgroundColor: session?.status === 'PENDING' ? '#FF4444' : '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '5px 10px',
                    cursor: 'pointer'
                }}
            >
                {session?.status || 'Unknown'}
            </button>

            <p>Team: {session.team_name}</p>
            <p>Coach: {session?.coach_email}</p>
            <p>URL: {session.footage_url}</p>
            <p>Uploaded: {formatDate(session.created_at)}</p>
            <p>Analysis Status: {session?.analyses?.length > 0 
                ? `${session.analyses.length} analyses uploaded` 
                : 'No analyses uploaded yet'
            }</p>

            {isExpanded && (
                <div 
                    style={{
                        marginTop: '15px',
                        paddingTop: '15px',
                        borderTop: '1px solid #333'
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="space-y-4">
                        {['HEATMAP', 'SPRINT_MAP', 'GAME_MOMENTUM'].map(type => (
                            <div key={type}>
                                <h4 style={{ color: '#60A5FA', marginBottom: '8px' }}>
                                    {type.replace('_', ' ')}
                                </h4>
                                <button
                                    onClick={() => handleFileSelect(type)}
                                    style={{
                                        width: '100%',
                                        padding: '16px',
                                        border: '2px dashed #4B5563',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        backgroundColor: 'transparent'
                                    }}
                                    disabled={uploading}
                                >
                                    {uploading ? 'Uploading...' : `Upload ${type.replace('_', ' ')}`}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default SessionCard;
