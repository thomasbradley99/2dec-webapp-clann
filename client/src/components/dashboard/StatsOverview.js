import React, { useState, useEffect } from 'react';
import sessionService from '../../services/sessionService';
import teamService from '../../services/teamService';

function StatsOverview() {
    const [stats, setStats] = useState({
        totalSessions: 0,
        pendingSessions: 0,
        completedToday: 0,
        activeTeams: [],
        newToday: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const [sessionStats, teams] = await Promise.all([
                sessionService.getSessionStats(),
                teamService.getAllTeams()
            ]);

            setStats({
                ...sessionStats,
                activeTeams: teams.sort((a, b) =>
                    (b.session_count || 0) - (a.session_count || 0)
                ).slice(0, 5) // Top 5 most active teams
            });
        } catch (err) {
            console.error('Failed to fetch stats:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="animate-pulse">Loading stats...</div>;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Overview Stats with FIFA-style circles */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h3 className="text-xl font-bold mb-6">Overview</h3>
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <span className="text-gray-400">Total Sessions</span>
                        <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold">{stats.totalSessions}</span>
                            <div className="w-8 h-8 rounded-full border-4 border-white/20 flex items-center justify-center">
                                <span className="text-white font-bold">{stats.totalSessions}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-gray-400">Pending Analysis</span>
                        <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-yellow-500">{stats.pendingSessions}</span>
                            <div className="w-8 h-8 rounded-full border-4 border-yellow-500/80 flex items-center justify-center">
                                <span className="text-yellow-500 font-bold">{stats.pendingSessions}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-gray-400">Completed Today</span>
                        <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-green-500">{stats.completedToday}</span>
                            <div className="w-8 h-8 rounded-full border-4 border-green-500/80 flex items-center justify-center">
                                <span className="text-green-500 font-bold">{stats.completedToday}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-gray-400">New Today</span>
                        <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-blue-500">{stats.newToday}</span>
                            <div className="w-8 h-8 rounded-full border-4 border-blue-500/80 flex items-center justify-center">
                                <span className="text-blue-500 font-bold">{stats.newToday}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Active Teams */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h3 className="text-xl font-bold mb-4">Most Active Teams</h3>
                <div className="space-y-3">
                    {stats.activeTeams.map(team => (
                        <div key={team.id} className="flex justify-between items-center">
                            <span className="text-gray-400">{team.name}</span>
                            <span className="font-bold">{team.session_count || 0} sessions</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Status Distribution */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h3 className="text-xl font-bold mb-4">Analysis Status</h3>
                <div className="relative pt-1">
                    <div className="flex mb-2 items-center justify-between">
                        <div>
                            <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-green-500 bg-green-500/20">
                                Complete
                            </span>
                        </div>
                        <div className="text-right">
                            <span className="text-xs font-semibold inline-block text-green-500">
                                {Math.round((stats.totalSessions - stats.pendingSessions) / stats.totalSessions * 100)}%
                            </span>
                        </div>
                    </div>
                    <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-700">
                        <div style={{ width: `${(stats.totalSessions - stats.pendingSessions) / stats.totalSessions * 100}%` }}
                            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500">
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default StatsOverview;
