import React, { useState } from 'react';
import sessionService from '../../services/sessionService';

function SessionCard({ session, onUpdate }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [uploading, setUploading] = useState(false);

    const getAnalysisImage = (type) => {
        switch(type) {
            case 'HEATMAP': return session.analysis_image1_url;
            case 'SPRINT_MAP': return session.analysis_image2_url;
            case 'GAME_MOMENTUM': return session.analysis_image3_url;
            default: return null;
        }
    };

    const getImageName = (url) => {
        if (!url) return null;
        return url.split('/').pop(); // Gets the filename from the URL
    };

    const handleFileUpload = async (type) => {
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
                onUpdate();
            } catch (err) {
                console.error('Upload failed:', err);
            } finally {
                setUploading(false);
            }
        };

        input.click();
    };

    const handleDeleteAnalysis = async (type) => {
        try {
            await sessionService.deleteAnalysis(session.id, type);
            onUpdate();
        } catch (err) {
            console.error('Delete failed:', err);
        }
    };

    const handleStatusToggle = async () => {
        try {
            await sessionService.toggleSessionStatus(session.id);
            onUpdate();
        } catch (err) {
            console.error('Failed to update status:', err);
        }
    };

    return (
        <div className={`bg-gray-900 rounded-lg overflow-hidden border-l-4 ${
            session.status === 'PENDING' 
                ? 'border-red-500' 
                : 'border-green-500'
        }`}>
            <div className="bg-gray-800/50 p-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-xl font-semibold text-white mb-2">
                            {session.team_name}
                        </h3>
                        <div className="space-y-1 text-sm text-gray-400">
                            <p className="truncate">URL: {session.footage_url}</p>
                            <p>Created: {new Date(session.created_at).toLocaleDateString()}</p>
                            <p>Session ID: {session.id.slice(0,8)}</p>
                        </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-2">
                        <button
                            onClick={handleStatusToggle}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                                session.status === 'PENDING' 
                                    ? 'bg-red-600/20 text-red-400 border border-red-600 hover:bg-red-600/30' 
                                    : 'bg-green-600/20 text-green-400 border border-green-600 hover:bg-green-600/30'
                            }`}
                        >
                            {session.status}
                        </button>
                    </div>
                </div>
            </div>

            <div className="p-4">
                <button 
                    onClick={() => setIsExpanded(!isExpanded)}
                    className={`w-full p-3 rounded flex items-center justify-between transition-colors ${
                        isExpanded 
                            ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30' 
                            : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800'
                    }`}
                >
                    <span>Analysis Dashboard</span>
                    <span>{isExpanded ? '↑' : '↓'}</span>
                </button>

                {isExpanded && (
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                        {['HEATMAP', 'SPRINT_MAP', 'GAME_MOMENTUM'].map(type => {
                            const imageUrl = getAnalysisImage(type);
                            const imageName = getImageName(imageUrl);

                            return (
                                <div key={type} className="bg-gray-900/50 border border-gray-700 p-4 rounded-lg">
                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="text-blue-400 font-medium">
                                            {type.replace('_', ' ')}
                                        </h4>
                                        {imageName && (
                                            <button
                                                onClick={() => handleDeleteAnalysis(type)}
                                                className="text-red-400 hover:text-red-300 px-2 py-1"
                                            >
                                                Delete
                                            </button>
                                        )}
                                    </div>

                                    {imageName ? (
                                        <div className="bg-black/50 p-3 rounded-lg">
                                            <p className="text-sm text-gray-400 mb-2">
                                                {imageName}
                                            </p>
                                            <div className="relative w-full" style={{ maxWidth: '400px', margin: '0 auto' }}>
                                                <div className="aspect-w-16 aspect-h-9">
                                                    <img 
                                                        src={imageUrl} 
                                                        alt={type}
                                                        className="rounded object-contain w-full h-full"
                                                        style={{ 
                                                            maxHeight: '200px',
                                                            backgroundColor: '#1a1a1a'
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => handleFileUpload(type)}
                                            disabled={uploading}
                                            className="w-full p-4 border-2 border-dashed 
                                                     border-gray-600 rounded hover:border-gray-500
                                                     transition-colors"
                                        >
                                            {uploading ? 'Uploading...' : `Upload ${type.replace('_', ' ')}`}
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

export default SessionCard;