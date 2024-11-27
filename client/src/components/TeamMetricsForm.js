import React, { useState } from 'react';
import sessionService from '../services/sessionService';

function TeamMetricsForm({ session, onUpdate }) {
    const [metrics, setMetrics] = useState({
        total_distance: session.team_metrics?.total_distance ?? 0,
        total_sprints: session.team_metrics?.total_sprints ?? 0,
        sprint_distance: session.team_metrics?.sprint_distance ?? 0,
        high_intensity_sprints: session.team_metrics?.high_intensity_sprints ?? 0,
        top_sprint_speed: session.team_metrics?.top_sprint_speed ?? 0
    });

    const handleNumberChange = (field, value, isInteger = false) => {
        const parsedValue = value === '' ? 0 : isInteger ? parseInt(value) : parseFloat(value);
        setMetrics(prev => ({
            ...prev,
            [field]: isNaN(parsedValue) ? 0 : parsedValue
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await sessionService.updateTeamMetrics(session.id, metrics);
            onUpdate();
        } catch (error) {
            console.error('Failed to update metrics:', error);
        }
    };

    return (
        <div className="bg-gray-900/50 border border-gray-700 p-4 rounded-lg">
            <h4 className="text-blue-400 font-medium mb-4">Team Metrics</h4>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm text-gray-400">Total Distance (m)</label>
                        <input 
                            type="number"
                            min="0"
                            step="any"
                            value={metrics.total_distance || ''}
                            onChange={(e) => handleNumberChange('total_distance', e.target.value)}
                            className="w-full bg-black/30 border border-gray-700 rounded p-2"
                        />
                    </div>
                    <div>
                        <label className="text-sm text-gray-400">Total Sprints</label>
                        <input 
                            type="number"
                            min="0"
                            step="1"
                            value={metrics.total_sprints || ''}
                            onChange={(e) => handleNumberChange('total_sprints', e.target.value, true)}
                            className="w-full bg-black/30 border border-gray-700 rounded p-2"
                        />
                    </div>
                    <div>
                        <label className="text-sm text-gray-400">Sprint Distance (m)</label>
                        <input 
                            type="number"
                            min="0"
                            step="any"
                            value={metrics.sprint_distance || ''}
                            onChange={(e) => handleNumberChange('sprint_distance', e.target.value)}
                            className="w-full bg-black/30 border border-gray-700 rounded p-2"
                        />
                    </div>
                    <div>
                        <label className="text-sm text-gray-400">High Intensity Sprints</label>
                        <input 
                            type="number"
                            min="0"
                            step="1"
                            value={metrics.high_intensity_sprints || ''}
                            onChange={(e) => handleNumberChange('high_intensity_sprints', e.target.value, true)}
                            className="w-full bg-black/30 border border-gray-700 rounded p-2"
                        />
                    </div>
                    <div>
                        <label className="text-sm text-gray-400">Top Sprint Speed (km/h)</label>
                        <input 
                            type="number"
                            min="0"
                            step="0.1"
                            value={metrics.top_sprint_speed || ''}
                            onChange={(e) => handleNumberChange('top_sprint_speed', e.target.value)}
                            className="w-full bg-black/30 border border-gray-700 rounded p-2"
                        />
                    </div>
                </div>
                <button 
                    type="submit"
                    className="bg-blue-500/20 text-blue-400 px-4 py-2 rounded hover:bg-blue-500/30"
                >
                    Save Metrics
                </button>
            </form>
        </div>
    );
}

export default TeamMetricsForm; 