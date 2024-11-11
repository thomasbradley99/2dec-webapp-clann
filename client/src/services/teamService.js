import api from './api';

const teamService = {
    getUserTeams: async () => {
        try {
            const response = await api.get('/teams/user');
            return response.data;
        } catch (error) {
            console.error('Error fetching teams:', error);
            throw error.response?.data?.error || 'Failed to fetch teams';
        }
    }
};

export default teamService;