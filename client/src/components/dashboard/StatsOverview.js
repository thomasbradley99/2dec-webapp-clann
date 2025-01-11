import React, { useState, useEffect } from 'react';
import sessionService from '../../services/sessionService';
import teamService from '../../services/teamService';

function StatsOverview() {
    const [stats, setStats] = useState({
        totalSessions: 0,
        pendingSessions: 0,
        completedSessions: 0,
        totalAccounts: 0,
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
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="animate-pulse">Loading stats...</div>;

    const completionPercentage = Math.round(
        (stats.completedSessions / (stats.totalSessions || 1)) * 100
    );

    return (
        <div className="space-y-6">
            {/* Company Totals Card */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h3 className="text-xl font-bold mb-4 text-center">CLANN ANALYSIS STATUS</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-center mb-6">
                    <div>
                        <div className="text-gray-400 text-sm">Total Teams</div>
                        <div className="text-2xl font-bold">{stats.teamStats.length}</div>
                    </div>
                    <div>
                        <div className="text-gray-400 text-sm">Total Users</div>
                        <div className="text-2xl font-bold">{stats.totalAccounts}</div>
                    </div>
                    <div>
                        <div className="text-gray-400 text-sm">Total Videos</div>
                        <div className="text-2xl font-bold">{stats.totalSessions}</div>
                    </div>
                    <div>
                        <div className="text-gray-400 text-sm">Pending Analysis</div>
                        <div className="text-2xl font-bold text-yellow-500">{stats.pendingSessions}</div>
                    </div>
                    <div>
                        <div className="text-gray-400 text-sm">Completed Analysis</div>
                        <div className="text-2xl font-bold text-green-500">{stats.completedSessions}</div>
                    </div>
                </div>

                {/* Progress Circle */}
                <div className="flex justify-center mb-6">
                    <div className="relative w-48 h-48">
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
                </div>

                <div className="flex justify-between text-sm">
                    <div className="text-yellow-500">
                        <span className="mr-2">🟡</span>
                        Pending: {stats.pendingSessions}
                    </div>
                    <div className="text-green-500">
                        <span className="mr-2">🟢</span>
                        Complete: {stats.completedSessions}
                    </div>
                </div>
            </div>

            {/* Team Submissions Card */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h3 className="text-xl font-bold mb-4 text-center">TEAM SUBMISSIONS</h3>
                <div className="mb-2 grid grid-cols-12 text-sm text-gray-400">
                    <div className="col-span-6">Team Name</div>
                    <div className="col-span-2 text-center">Total</div>
                    <div className="col-span-4 text-right">Pending/Reviewed</div>
                </div>
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {stats.teamStats.map(team => {
                        const totalSubmissions = (team.pending_count || 0) + (team.reviewed_count || 0);
                        return (
                            <div key={team.id} className="grid grid-cols-12 items-center py-2 border-t border-gray-700">
                                <div className="col-span-6 text-gray-300">{team.name}</div>
                                <div className="col-span-2 text-center">{totalSubmissions}</div>
                                <div className="col-span-4 text-right">
                                    <span className="text-yellow-500">
                                        <span className="mr-1">🟡</span>{team.pending_count || 0}
                                    </span>
                                    {" / "}
                                    <span className="text-green-500">
                                        <span className="mr-1">🟢</span>{team.reviewed_count || 0}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div className="text-xs text-gray-500 mt-4 text-center">
                    (Pending / Reviewed)
                </div>
            </div>
        </div>
    );
}

export default StatsOverview;
