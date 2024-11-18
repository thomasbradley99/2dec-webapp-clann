import React from 'react';
import SessionCard from './SessionCard';

function SessionList({ sessions, onSessionClick }) {
    return (
        <div className="grid gap-4">
            {sessions.map(session => (
                <SessionCard
                    key={session.id}
                    session={session}
                    onClick={() => onSessionClick(session)}
                />
            ))}
        </div>
    );
}

export default SessionList;
