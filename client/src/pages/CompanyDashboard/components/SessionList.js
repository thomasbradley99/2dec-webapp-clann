import React from 'react';
import SessionCard from './SessionCard';

function SessionList({ sessions, onSessionClick, onStatusToggle }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
