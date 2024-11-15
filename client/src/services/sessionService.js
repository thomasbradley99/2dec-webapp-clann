import api from './api';

const sessionService = {
    async createSession(footage_url, team_name) {
        try {
            const response = await api.post('/sessions/create', {
                footage_url,
                team_name
            });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.error || 'Failed to create session');
        }
    },

    async getSessions() {
        try {
            const response = await api.get('/sessions');
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.error || 'Failed to fetch sessions');
        }
    },

    async deleteSession(sessionId) {
        try {
            const response = await api.delete(`/sessions/${sessionId}`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.error || 'Failed to delete session');
        }
    },

    async addAnalysis(sessionId, formData) {
        try {
            const response = await api.post(`/sessions/${sessionId}/analysis`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.error || 'Failed to add analysis');
        }
    },

    async toggleSessionStatus(sessionId) {
        try {
            const response = await api.put(`/sessions/${sessionId}/toggle-status`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.error || 'Failed to toggle session status');
        }
    },

    async joinTeam(team_code) {
        try {
            const response = await api.post('/teams/join', {
                team_code
            });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.error || 'Failed to join team');
        }
    },

    async deleteAnalysis(analysisId) {
        if (!analysisId) {
            throw new Error('Analysis ID is required');
        }

        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const response = await api.delete(`/sessions/analysis/${analysisId}`, {
                headers: {
                    'Authorization': `Bearer ${user.token}`,
                    'user-id': user.id
                }
            });
            return response.data;
        } catch (error) {
            console.error('Delete analysis error:', error);
            throw new Error(error.response?.data?.error || 'Failed to delete analysis');
        }
    },

    getAllSessions: async () => {
        try {
            const response = await api.get('/sessions/all');
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.error || 'Failed to fetch sessions');
        }
    }
};

export default sessionService; 