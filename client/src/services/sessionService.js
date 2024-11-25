import api from './api';

const sessionService = {
    getSessions: async () => {
        try {
            console.log('Fetching sessions...');
            const response = await api.get('/sessions');
            console.log('Sessions response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Fetch error details:', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message
            });
            throw new Error(error.response?.data?.error || 'Failed to fetch sessions');
        }
    },

    createSession: async (url, teamName) => {
        try {
            const response = await api.post('/sessions/create', { 
                footage_url: url, 
                team_name: teamName 
            });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.error || 'Failed to create session');
        }
    },

    deleteSession: async (sessionId) => {
        try {
            await api.delete(`/sessions/${sessionId}`);
        } catch (error) {
            throw new Error(error.response?.data?.error || 'Failed to delete session');
        }
    }
};

export default sessionService; 