import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

const getHeaders = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    return {
        headers: {
            'user-id': user?.id
        }
    };
};

const sessionService = {
    getSessions: async () => {
        try {
            const response = await axios.get(`${API_URL}/sessions`, getHeaders());
            return response.data;
        } catch (error) {
            throw error.response?.data?.error || 'Failed to fetch sessions';
        }
    },

    createSession: async (url, teamName) => {
        try {
            const response = await axios.post(`${API_URL}/sessions/create`, {
                footage_url: url,
                team_name: teamName
            }, getHeaders());
            return response.data;
        } catch (error) {
            throw error.response?.data?.error || 'Failed to create session';
        }
    },

    deleteSession: async (sessionId) => {
        const user = JSON.parse(localStorage.getItem('user'));
        const response = await axios.delete(`${API_URL}/sessions/${sessionId}`, {
            headers: {
                'Authorization': `Bearer ${user.token}`,
                'user-id': user.id
            }
        });
        return response.data;
    }
};

export default sessionService; 