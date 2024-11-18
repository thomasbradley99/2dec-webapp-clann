import React from 'react';

function SessionCard({ session, onClick }) {
    return (
        <div 
            className="bg-gray-800 rounded-lg p-5 cursor-pointer hover:bg-gray-700"
            onClick={onClick}
        >
            <h3 className="text-xl mb-2">{session.team_name}</h3>
            <p className="text-gray-400">
                Uploaded by {session.uploaded_by_email}
            </p>
            <p className="text-gray-400 text-sm">
                {new Date(session.created_at).toLocaleDateString()}
            </p>
            <div className="mt-3">
                <span className={`font-bold ${
                    session.status === 'PENDING' ? 'text-red-400' : 'text-green-400'
                }`}>
                    {session.status}
                </span>
            </div>
        </div>
    );
}

export default SessionCard;
