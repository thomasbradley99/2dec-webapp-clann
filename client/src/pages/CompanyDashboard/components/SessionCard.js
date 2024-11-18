import React from 'react';

function SessionCard({ session, onClick, onStatusToggle }) {
    // Format the date nicely
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-all">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-xl font-semibold mb-1">
                        {session?.team_name || 'Unknown Team'}
                    </h3>
                    <div className="text-sm text-gray-400 space-y-1">
                        <p>Coach: {session?.coach_email || 'Unknown Coach'}</p>
                        <p>Uploaded: {session?.created_at ? formatDate(session.created_at) : 'Date unknown'}</p>
                        <p className="font-mono">ID: {session?.id?.slice(0, 8)}</p>
                    </div>
                </div>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onStatusToggle(session.id);
                    }}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-all hover:opacity-80 ${
                        session?.status === 'PENDING' 
                        ? 'bg-red-900/50 text-red-400 hover:bg-red-800/50' 
                        : 'bg-green-900/50 text-green-400 hover:bg-green-800/50'
                    }`}
                >
                    {session?.status || 'Unknown'}
                </button>
            </div>
            
            <div className="space-y-2 text-gray-400">
                {session?.footage_url && (
                    <p className="text-sm truncate">
                        <span className="font-medium">Footage:</span>{' '}
                        <a 
                            href={session.footage_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:underline"
                            onClick={e => e.stopPropagation()}
                        >
                            View Source
                        </a>
                    </p>
                )}
                <div className="pt-2 border-t border-gray-700">
                    <p className="text-sm">
                        <span className="font-medium">Analysis Status:</span>{' '}
                        {session?.analysis_count 
                            ? `${session.analysis_count} analyses uploaded`
                            : 'No analyses uploaded yet'
                        }
                    </p>
                    {session?.analysis_count > 0 && session?.analysis_types && (
                        <div className="flex gap-2 mt-2 flex-wrap">
                            {session.analysis_types
                                .filter(type => type !== null)
                                .map(type => (
                                    <span 
                                        key={type}
                                        className="text-xs px-2 py-1 bg-blue-900/50 text-blue-400 rounded"
                                    >
                                        {type}
                                    </span>
                                ))}
                        </div>
                    )}
                </div>
                <div 
                    className="mt-4 text-blue-400 text-sm cursor-pointer hover:underline"
                    onClick={onClick}
                >
                    View/Upload Analyses →
                </div>
            </div>
        </div>
    );
}

export default SessionCard;
