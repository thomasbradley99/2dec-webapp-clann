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

const teamService = {
    getUserTeams: async () => {
        try {
            const response = await axios.get(`${API_URL}/teams/user`, getHeaders());
            return response.data;
        } catch (error) {
            throw error.response?.data?.error || 'Failed to fetch teams';
        }
    },

    createTeam: async (name, teamCode) => {
        try {
            const response = await axios.post(`${API_URL}/teams/create`, {
                name,
                team_code: teamCode
            }, getHeaders());
            return response.data;
        } catch (error) {
            throw error.response?.data?.error || 'Failed to create team';
        }
    },

    joinTeam: async (teamCode) => {
        try {
            const response = await axios.post(`${API_URL}/teams/join`, {
                team_code: teamCode
            }, getHeaders());
            return response.data;
        } catch (error) {
            throw error.response?.data?.error || 'Failed to join team';
        }
    }
};

export default teamService;