import React, { useState, useEffect } from 'react';
import sessionService from '../../services/sessionService';
import teamService from '../../services/teamService';

function StatsOverview() {
    const [stats, setStats] = useState({
        total_teams: 0,
        total_accounts: 0,
        all_sessions: 0,
        valid_sessions: 0,
        pending_valid: 0,
        completed_valid: 0,
        teamStats: []
    });
    const [activeTeamId, setActiveTeamId] = useState(null);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [teamMembers, setTeamMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showTeamMembers, setShowTeamMembers] = useState(false);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const sessionStats = await sessionService.getSessionStats();
            console.log('Received stats:', sessionStats);
            setStats(sessionStats);
        } catch (err) {
            console.error('Failed to fetch stats:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleTeamClick = async (teamId, teamName, e) => {
        e.preventDefault();
        if (activeTeamId === teamId) {
            setActiveTeamId(null);
            return;
        }
        try {
            const data = await teamService.getTeamMembers(teamId);
            setTeamMembers(data);
            setSelectedTeam(teamName);
            setActiveTeamId(teamId);
        } catch (err) {
            console.error('Error fetching team members:', err);
        }
    };

    const TeamMembersModal = ({ team, members, onClose }) => (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-lg max-w-lg w-full">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-white">{team} - Team Members</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
                </div>
                <div className="space-y-2">
                    {members.map((member, i) => (
                        <div key={i} className="flex justify-between items-center p-2 bg-gray-700 rounded">
                            <span className="text-white">{member.email}</span>
                            {member.is_admin && (
                                <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                                    Admin
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    if (loading) return <div className="animate-pulse">Loading stats...</div>;

    const completionPercentage = Math.round(
        (stats.completed_valid / (stats.valid_sessions || 1)) * 100
    );

    return (
        <div className="space-y-6">
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h3 className="text-xl font-bold mb-4 text-center">CLANN ANALYSIS STATUS</h3>

                {/* Top Stats Grid */}
                <div className="grid grid-cols-3 gap-4 text-center mb-6">
                    <div>
                        <div className="text-gray-400 text-sm">Total Teams</div>
                        <div className="text-2xl font-bold">{stats.total_teams || 0}</div>
                    </div>
                    <div>
                        <div className="text-gray-400 text-sm">Total Users</div>
                        <div className="text-2xl font-bold">{stats.total_accounts || 0}</div>
                    </div>
                    <div>
                        <div className="text-gray-400 text-sm">Total Videos</div>
                        <div className="text-2xl font-bold">{stats.all_sessions || 0}</div>
                    </div>
                </div>

                {/* Progress Circle and Stats */}
                <div className="flex items-center justify-between mb-6">
                    <div className="text-center">
                        <div className="text-3xl font-bold text-yellow-500">
                            {stats.pending_valid || 0}
                        </div>
                        <div className="text-sm text-gray-400">Pending</div>
                    </div>

                    {/* Progress Circle */}
                    <div className="relative w-32 h-32">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle
                                className="text-gray-700"
                                strokeWidth="8"
                                stroke="currentColor"
                                fill="transparent"
                                r="58"
                                cx="64"
                                cy="64"
                            />
                            <circle
                                className="text-green-500"
                                strokeWidth="8"
                                strokeLinecap="round"
                                stroke="currentColor"
                                fill="transparent"
                                r="58"
                                cx="64"
                                cy="64"
                                strokeDasharray={`${2 * Math.PI * 58}`}
                                strokeDashoffset={`${2 * Math.PI * 58 * (1 - completionPercentage / 100)}`}
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-2xl font-bold">{completionPercentage || 0}%</span>
                        </div>
                    </div>

                    <div className="text-center">
                        <div className="text-3xl font-bold text-green-500">
                            {stats.completed_valid || 0}
                        </div>
                        <div className="text-sm text-gray-400">Complete</div>
                    </div>
                </div>

                {/* Team Submissions */}
                <div className="mt-8">
                    <h4 className="text-lg font-semibold mb-4">TEAM SUBMISSIONS</h4>
                    <div className="grid grid-cols-12 text-sm text-gray-400 mb-2">
                        <div className="col-span-4">Team Name</div>
                        <div className="col-span-2 text-center">Members</div>
                        <div className="col-span-2 text-center">Total</div>
                        <div className="col-span-4 text-right">Pending/Complete</div>
                    </div>
                    <div className="space-y-1">
                        {(stats.team_stats || []).map(team => (
                            <div key={team.id} className="grid grid-cols-12 items-center py-1 border-t border-gray-700">
                                <div className="relative">
                                    <div
                                        className="col-span-4 text-gray-300 cursor-pointer hover:text-blue-400 transition-colors flex items-center gap-2"
                                        onClick={(e) => handleTeamClick(team.id, team.name, e)}
                                    >
                                        {team.name}
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                    {activeTeamId === team.id && (
                                        <TeamMembersModal
                                            team={team.name}
                                            members={teamMembers}
                                            onClose={() => setActiveTeamId(null)}
                                        />
                                    )}
                                </div>
                                <div className="col-span-2 text-center">{team.member_count || 0}</div>
                                <div className="col-span-2 text-center">{team.total_valid_sessions}</div>
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
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default StatsOverview;
