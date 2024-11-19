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
        <div 
            style={{
                padding: '15px',
                marginBottom: '10px',
                backgroundColor: '#1a1a1a',
                borderRadius: '4px',
                border: '1px solid #333',
                position: 'relative'
            }}
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

            <button 
                onClick={onClick}
                style={{
                    marginTop: '10px',
                    color: '#3B82F6',
                    cursor: 'pointer',
                    background: 'none',
                    border: 'none',
                    padding: 0
                }}
            >
                View/Upload →
            </button>
        </div>
    );
}

export default SessionCard;
