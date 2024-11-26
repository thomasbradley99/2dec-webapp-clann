import React, { useState } from 'react';
import sessionService from '../../../services/sessionService';

function AnalysisModal({ session, onClose, onError }) {
    const [isUploading, setIsUploading] = useState(false);
    const [feedback, setFeedback] = useState(null);

    const handleFileSelect = async (event, type) => {
        const file = event.target.files[0];
        if (!file) {
            console.log('No file selected');
            return;
        }

        try {
            setIsUploading(true);
            const formData = new FormData();
            formData.append('file', file);
            formData.append('sessionId', session.id);
            formData.append('type', type);

            console.log('Uploading file:', {
                fileName: file.name,
                fileSize: file.size,
                fileType: file.type,
                sessionId: session.id,
                type: type
            });

            const result = await sessionService.addAnalysis(formData);
            console.log('Upload result:', result);
            
            setFeedback({
                type: 'success',
                message: 'Analysis uploaded successfully'
            });
            
            onClose();
        } catch (err) {
            console.error('Upload error:', err);
            setFeedback({
                type: 'error',
                message: err.message || 'Failed to upload analysis'
            });
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                {feedback && (
                    <div className={`feedback ${feedback.type}`}>
                        {feedback.message}
                    </div>
                )}

                <div className="upload-section">
                    <h3>Upload Analysis</h3>
                    <div className="upload-buttons">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileSelect(e, 'HEATMAP')}
                            disabled={isUploading}
                        />
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileSelect(e, 'SPRINT_MAP')}
                            disabled={isUploading}
                        />
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileSelect(e, 'GAME_MOMENTUM')}
                            disabled={isUploading}
                        />
                    </div>
                </div>

                <button 
                    onClick={onClose}
                    disabled={isUploading}
                    className="close-button"
                >
                    {isUploading ? 'Uploading...' : 'Close'}
                </button>
            </div>
        </div>
    );
}

export default AnalysisModal;
