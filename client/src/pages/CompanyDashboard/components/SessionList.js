import React from 'react';

function SessionList({ sessions, onSessionClick, onStatusToggle }) {
    return (
        <div className="sessions-grid">
            {sessions.map(session => (
                <div key={session.id} className="session-card">
                    <h3>Team: {session.team_name}</h3>
                    <p>URL: {session.footage_url}</p>
                    <p>Status: {session.status}</p>
                    <button 
                        onClick={() => onSessionClick(session)}
                        className="analysis-button"
                    >
                        Add Analysis
                    </button>
                    {onStatusToggle && (
                        <button 
                            onClick={() => onStatusToggle(session.id)}
                            className={`status-button ${session.status.toLowerCase()}`}
                        >
                            {session.status}
                        </button>
                    )}
                </div>
            ))}
        </div>
    );
}

export default SessionList;
