import React from 'react';
import SessionCard from './SessionCard';

function SessionList({ sessions, onSessionClick, onStatusToggle }) {
    return (
        <div style={{ marginTop: '30px' }}>
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
