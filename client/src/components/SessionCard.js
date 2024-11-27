import React from 'react';
import { useNavigate } from 'react-router-dom';

function SessionCard({ session }) {
    const navigate = useNavigate();

    return (
        <div 
            onClick={() => navigate(`/session/${session.id}`)}
            className="cursor-pointer border border-gray-700 rounded-lg p-6 bg-gray-800 
                       hover:bg-gray-700 transition-colors"
        >
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-xl font-semibold text-white">
                        {session.team_name}
                    </h3>
                    <p className="text-gray-400 mt-2">
                        Status: <span className={
                            session.status === 'PENDING' ? 'text-yellow-400' : 'text-green-400'
                        }>{session.status}</span>
                    </p>
                </div>
                <span className="text-blue-400">→</span>
            </div>
        </div>
    );
}

export default SessionCard; 