import React, { useEffect, useState } from 'react';
import sessionService from '../services/sessionService';

function StatsOverview() {
    const [stats, setStats] = useState({
        totalSessions: 0,
        pendingSessions: 0,
        completedToday: 0,
        newToday: 0,
        activeTeams: []
    });

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await sessionService.getSessionStats();
            setStats(response);
        } catch (err) {
            console.error('Failed to fetch stats:', err);
        }
    };

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gray-800 p-4 rounded-lg">
                <h3 className="text-gray-400 text-sm">Total Sessions</h3>
                <p className="text-2xl font-bold">{stats.totalSessions}</p>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
                <h3 className="text-gray-400 text-sm">Pending Analysis</h3>
                <p className="text-2xl font-bold">{stats.pendingSessions}</p>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
                <h3 className="text-gray-400 text-sm">Completed Today</h3>
                <p className="text-2xl font-bold">{stats.completedToday}</p>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
                <h3 className="text-gray-400 text-sm">New Today</h3>
                <p className="text-2xl font-bold">{stats.newToday}</p>
            </div>
        </div>
    );
}

export default StatsOverview; 