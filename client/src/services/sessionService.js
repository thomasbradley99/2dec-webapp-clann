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

    async joinTeam(teamCode) {
        try {
            const response = await api.post('/teams/join', { team_code: teamCode });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.error || 'Failed to join team');
        }
    }
};

export default sessionService; 