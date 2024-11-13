import api from './api';

const sessionService = {
    async getSessions() {
        try {
            const response = await api.get('/sessions');
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.error || 'Failed to fetch sessions');
        }
    },
    // ... other methods
};

export default sessionService; 