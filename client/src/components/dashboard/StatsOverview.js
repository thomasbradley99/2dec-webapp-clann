import React, { useState, useEffect } from 'react';
import sessionService from '../../services/sessionService';
import teamService from '../../services/teamService';

function StatsOverview() {
    const [stats, setStats] = useState({
        totalSessions: 0,
        pendingSessions: 0,
        completedSessions: 0,
        teamStats: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const sessionStats = await sessionService.getSessionStats();
            console.log('Received stats:', sessionStats);
            setStats({
                ...sessionStats,
                teamStats: sessionStats.teamStats || []
            });
        } catch (err) {
            console.error('Failed to fetch stats:', err);
            setStats(prev => ({
                ...prev,
                teamStats: []
            }));
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="animate-pulse">Loading stats...</div>;

    const completionPercentage = Math.round(
        (stats.completedSessions / (stats.totalSessions || 1)) * 100
    );

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Analysis Status Circle */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h3 className="text-xl font-bold mb-6 text-center">Analysis Status</h3>
                <div className="relative w-48 h-48 mx-auto mb-6">
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-3xl font-bold">{completionPercentage}%</span>
                    </div>
                    <svg className="w-full h-full transform -rotate-90">
                        <circle
                            className="text-gray-700"
                            strokeWidth="8"
                            stroke="currentColor"
                            fill="transparent"
                            r="70"
                            cx="96"
                            cy="96"
                        />
                        <circle
                            className="text-green-500"
                            strokeWidth="8"
                            stroke="currentColor"
                            fill="transparent"
                            r="70"
                            cx="96"
                            cy="96"
                            strokeDasharray={`${2 * Math.PI * 70}`}
                            strokeDashoffset={`${2 * Math.PI * 70 * (1 - completionPercentage / 100)}`}
                        />
                    </svg>
                </div>
                <div className="flex justify-between text-sm">
                    <div className="text-yellow-500">Pending: {stats.pendingSessions}</div>
                    <div className="text-green-500">Complete: {stats.completedSessions}</div>
                </div>
            </div>

            {/* Team Activity */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h3 className="text-xl font-bold mb-4">Team Activity</h3>
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {Array.isArray(stats.teamStats) && stats.teamStats.map(team => (
                        <div key={team.id} className="flex justify-between items-center py-2">
                            <span className="text-gray-300">{team.name}</span>
                            <span className="text-gray-400">
                                {team.pending_count || 0} / {team.reviewed_count || 0}
                            </span>
                        </div>
                    ))}
                </div>
                <div className="text-xs text-gray-500 mt-4 text-center">
                    (Pending / Reviewed)
                </div>
            </div>
        </div>
    );
}

export default StatsOverview;
