import React from 'react';
import { 
    CalendarIcon, 
    ClockIcon, 
    UserCircleIcon, 
    VideoCameraIcon,
    ChartBarIcon,
    TagIcon
} from '@heroicons/react/24/outline';

function SessionCard({ session, onClick, onStatusToggle }) {
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString();
    };

    return (
        <div className="p-4 bg-[#1a1a1a] relative">
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onStatusToggle(session.id);
                }}
                className={`absolute top-4 right-4 px-3 py-1 rounded text-sm ${
                    session?.status === 'PENDING' 
                    ? 'bg-red-500 text-white' 
                    : 'bg-green-500 text-white'
                }`}
            >
                {session?.status || 'Unknown'}
            </button>

            <p>Team: {session.team_name}</p>
            <p className="text-gray-400">Coach: {session?.coach_email}</p>
            <p className="text-gray-400">URL: {session.footage_url}</p>
            <p className="text-gray-400">Uploaded: {formatDate(session.created_at)}</p>
            <p className="text-gray-400 mt-2">
                Analysis Status: {session?.analyses?.length > 0 
                    ? `${session.analyses.length} analyses uploaded` 
                    : 'No analyses uploaded yet'
                }
            </p>
            <button 
                className="text-blue-400 hover:underline mt-2"
                onClick={onClick}
            >
                View/Upload →
            </button>
        </div>
    );
}

export default SessionCard;
