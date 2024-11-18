import React, { useState } from 'react';
import sessionService from '../../../services/sessionService';

function AnalysisModal({ session, onClose, onError }) {
    const [uploading, setUploading] = useState(false);

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
                onClose(); // Close and refresh parent
            } catch (err) {
                onError(err.message || 'Upload failed');
            } finally {
                setUploading(false);
            }
        };

        input.click();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full">
                <div className="flex justify-between mb-4">
                    <h3 className="text-xl">{session.team_name}</h3>
                    <button onClick={onClose}>×</button>
                </div>

                <div className="space-y-4">
                    {['HEATMAP', 'SPRINT_MAP', 'GAME_MOMENTUM'].map(type => (
                        <div key={type}>
                            <h4 className="text-blue-400 mb-2">
                                {type.replace('_', ' ')}
                            </h4>
                            <button
                                onClick={() => handleFileSelect(type)}
                                className="w-full py-4 border-2 border-dashed border-gray-600 rounded hover:border-blue-400"
                                disabled={uploading}
                            >
                                {uploading ? 'Uploading...' : `Upload ${type.replace('_', ' ')}`}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default AnalysisModal;
