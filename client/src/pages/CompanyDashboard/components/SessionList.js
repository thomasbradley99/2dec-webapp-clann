import React from 'react';
import SessionCard from './SessionCard';

function SessionList({ sessions, onStatusToggle, onError }) {
    return (
        <div style={{ marginTop: '30px' }}>
            {sessions.map(session => (
                <SessionCard
                    key={session.id}
                    session={session}
                    onStatusToggle={onStatusToggle}
                    onError={onError}
                />
            ))}
        </div>
    );
}

export default SessionList;
