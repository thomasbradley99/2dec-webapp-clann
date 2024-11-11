import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

const sessionService = {
    createSession: async (url, teamName) => {
        try {
            const response = await axios.post(`${API_URL}/sessions/create`, {
                footage_url: url,
                team_name: teamName
            });
            return response.data;
        } catch (error) {
            throw error.response?.data?.error || 'Failed to create session';
        }
    },
    getSessions: async () => {
        try {
            console.log('Fetching sessions...');
            const response = await axios.get(`${API_URL}/sessions`);
            console.log('Sessions response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Sessions fetch error:', error);
            throw error.response?.data?.error || 'Failed to fetch sessions';
        }
    },
    deleteSession: async (sessionId) => {
        try {
            await axios.delete(`${API_URL}/sessions/${sessionId}`);
        } catch (error) {
            throw error.response?.data?.error || 'Failed to delete session';
        }
    }
};

export default sessionService; 