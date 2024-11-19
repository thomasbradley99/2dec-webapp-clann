import React from 'react';
import SessionCard from './SessionCard';

function SessionList({ sessions, onSessionClick, onStatusToggle }) {
    return (
        <div className="space-y-4">
            {sessions.map(session => (
                <SessionCard
                    key={session.id}
                    session={session}
                    onClick={() => onSessionClick(session)}
                    onStatusToggle={onStatusToggle}
                />
            ))}
        </div>
    );
}

export default SessionList;
